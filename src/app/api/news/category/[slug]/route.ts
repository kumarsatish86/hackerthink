import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // First, get the category from the slug
    const categoryResult = await pool.query(
      `SELECT id, name FROM news_categories WHERE slug = $1`,
      [slug]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ 
        news: [],
        pagination: { total: 0, pages: 0, page: 1, limit }
      });
    }

    const category = categoryResult.rows[0];
    
    // Count total news for this category
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM news 
       WHERE status = 'published' AND category_id = $1`,
      [category.id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch news for this category
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.title,
        n.slug,
        n.excerpt,
        n.featured_image,
        n.created_at,
        n.updated_at,
        n.publish_date,
        u.name as author_name,
        nc.name as category_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.status = 'published' AND nc.id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
      [category.id, limit, offset]
    );

    return NextResponse.json({
      news: rows,
      category: category.name,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching category news:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

