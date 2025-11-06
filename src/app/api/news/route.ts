import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Get published news items
    const newsResult = await pool.query(
      `SELECT 
        n.id::text as id,
        n.title,
        n.slug,
        n.excerpt,
        n.featured_image,
        n.created_at,
        n.updated_at,
        u.name as author_name,
        nc.name as category_name,
        nc.slug as category_slug,
        'news' as source_type
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.status = 'published'
      ORDER BY n.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total 
       FROM news 
       WHERE status = 'published'`
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const news = newsResult.rows.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      featured_image: item.featured_image || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      author_name: item.author_name || 'AI News Staff',
      category_name: item.category_name || 'General',
      category_slug: item.category_slug || '',
      source_type: item.source_type,
    }));

    return NextResponse.json({
      news,
      pagination: {
        total,
        pages: totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
