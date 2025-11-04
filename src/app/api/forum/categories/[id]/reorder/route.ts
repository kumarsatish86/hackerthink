import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// POST /api/forum/categories/[id]/reorder - Reorder categories (admin only)
export async function POST(
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
    const { newOrder } = body;

    if (typeof newOrder !== 'number') {
      return NextResponse.json(
        { error: 'newOrder must be a number' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCheck = await pool.query(
      'SELECT id FROM forum_categories WHERE id = $1',
      [categoryId]
    );

    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update display order
    const result = await pool.query(
      `UPDATE forum_categories
       SET display_order = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newOrder, categoryId]
    );

    const category = result.rows[0];
    category.permissions = typeof category.permissions === 'string' 
      ? JSON.parse(category.permissions) 
      : category.permissions;

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error reordering forum category:', error);
    return NextResponse.json(
      { error: 'Failed to reorder category' },
      { status: 500 }
    );
  }
}

