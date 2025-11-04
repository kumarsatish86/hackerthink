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

// GET /api/forum/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    // Check if forum_categories table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_categories'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('forum_categories table does not exist yet. Returning empty array.');
      return NextResponse.json({ categories: [] });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    let query = `
      SELECT 
        fc.id,
        fc.name,
        fc.slug,
        fc.description,
        fc.parent_id,
        fc.display_order,
        fc.permissions,
        fc.created_at,
        fc.updated_at
    `;

    if (includeStats) {
      query += `,
        COUNT(DISTINCT ft.id) as thread_count,
        COUNT(DISTINCT fp.id) as post_count,
        MAX(ft.last_post_at) as last_activity
      `;
    }

    query += `
      FROM forum_categories fc
    `;

    if (includeStats) {
      query += `
        LEFT JOIN forum_threads ft ON ft.category_id = fc.id
        LEFT JOIN forum_posts fp ON fp.thread_id = ft.id
      `;
    }

    query += `
      GROUP BY fc.id
      ORDER BY fc.display_order ASC, fc.name ASC
    `;

    const result = await pool.query(query);

    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id,
      display_order: row.display_order,
      permissions: typeof row.permissions === 'string' 
        ? JSON.parse(row.permissions) 
        : row.permissions,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(includeStats && {
        thread_count: parseInt(row.thread_count) || 0,
        post_count: parseInt(row.post_count) || 0,
        last_activity: row.last_activity,
      }),
    }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching forum categories:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "forum_categories"')) {
      console.log('forum_categories table does not exist. Returning empty array.');
      return NextResponse.json({ categories: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/forum/categories - Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if forum_categories table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_categories'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json(
        { error: 'Forum tables not initialized. Please run database migrations first.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, description, parent_id, display_order, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check if slug already exists
    const existingCheck = await pool.query(
      'SELECT id FROM forum_categories WHERE slug = $1',
      [slug]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const defaultPermissions = {
      view: 'all',
      post: 'registered',
      reply: 'registered',
    };

    const result = await pool.query(
      `INSERT INTO forum_categories (name, slug, description, parent_id, display_order, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        slug,
        description || null,
        parent_id || null,
        display_order || 0,
        JSON.stringify(permissions || defaultPermissions),
      ]
    );

    const category = result.rows[0];
    category.permissions = typeof category.permissions === 'string' 
      ? JSON.parse(category.permissions) 
      : category.permissions;

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating forum category:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    // If table doesn't exist, return helpful error
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "forum_categories"')) {
      return NextResponse.json(
        { error: 'Forum tables not initialized. Please run database migrations first.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category', message: error.message },
      { status: 500 }
    );
  }
}

