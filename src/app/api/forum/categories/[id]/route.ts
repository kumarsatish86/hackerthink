import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import slugify from 'slugify';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT 
        fc.*,
        COUNT(DISTINCT ft.id) as thread_count,
        COUNT(DISTINCT fp.id) as post_count,
        MAX(ft.last_post_at) as last_activity
       FROM forum_categories fc
       LEFT JOIN forum_threads ft ON ft.category_id = fc.id
       LEFT JOIN forum_posts fp ON fp.thread_id = ft.id
       WHERE fc.id = $1
       GROUP BY fc.id`,
      [categoryId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const category = result.rows[0];
    category.permissions = typeof category.permissions === 'string' 
      ? JSON.parse(category.permissions) 
      : category.permissions;

    return NextResponse.json({
      category: {
        ...category,
        thread_count: parseInt(category.thread_count) || 0,
        post_count: parseInt(category.post_count) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching forum category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/categories/[id] - Update a category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, parent_id, display_order, permissions } = body;

    // Check if category exists
    const existingCheck = await pool.query(
      'SELECT id, slug FROM forum_categories WHERE id = $1',
      [categoryId]
    );

    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      const slug = slugify(name, { lower: true, strict: true });
      // Check if new slug conflicts with another category
      const slugCheck = await pool.query(
        'SELECT id FROM forum_categories WHERE slug = $1 AND id != $2',
        [slug, categoryId]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        );
      }

      updates.push(`name = $${paramIndex++}`);
      updates.push(`slug = $${paramIndex++}`);
      values.push(name, slug);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description || null);
    }

    if (parent_id !== undefined) {
      // Prevent circular reference
      if (parent_id === categoryId) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

      updates.push(`parent_id = $${paramIndex++}`);
      values.push(parent_id || null);
    }

    if (display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(display_order);
    }

    if (permissions !== undefined) {
      updates.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(permissions));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(categoryId);

    const query = `
      UPDATE forum_categories
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    const category = result.rows[0];
    category.permissions = typeof category.permissions === 'string' 
      ? JSON.parse(category.permissions) 
      : category.permissions;

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating forum category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/categories/[id] - Delete a category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category has child categories
    const childCheck = await pool.query(
      'SELECT COUNT(*) FROM forum_categories WHERE parent_id = $1',
      [categoryId]
    );

    if (parseInt(childCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories' },
        { status: 400 }
      );
    }

    // Check if category has threads
    const threadCheck = await pool.query(
      'SELECT COUNT(*) FROM forum_threads WHERE category_id = $1',
      [categoryId]
    );

    if (parseInt(threadCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with threads. Please delete or move threads first.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM forum_categories WHERE id = $1 RETURNING id',
      [categoryId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

