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

    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();

    // Get today's published articles
    const articlesResult = await pool.query(
      `SELECT 
        a.id::text as id,
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image,
        a.created_at,
        a.updated_at,
        a.created_at as publish_date,
        u.name as author_name,
        c.name as category_name,
        'article' as source_type
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true 
        AND DATE(a.created_at) = DATE($1)
      ORDER BY a.created_at DESC`,
      [todayStart]
    );

    // Get today's published news items
    const newsResult = await pool.query(
      `SELECT 
        n.id::text as id,
        n.title,
        n.slug,
        n.excerpt,
        n.featured_image,
        n.created_at,
        n.updated_at,
        n.publish_date,
        u.name as author_name,
        nc.name as category_name,
        'news' as source_type
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.status = 'published' 
        AND DATE(COALESCE(n.publish_date, n.created_at)) = DATE($1)
      ORDER BY COALESCE(n.publish_date, n.created_at) DESC`,
      [todayStart]
    );

    // Combine both results and sort by publish date
    const allItems = [...articlesResult.rows, ...newsResult.rows].sort((a, b) => {
      const dateA = new Date(a.publish_date || a.created_at).getTime();
      const dateB = new Date(b.publish_date || b.created_at).getTime();
      return dateB - dateA;
    });

    // Get total count
    const total = allItems.length;

    // Apply pagination
    const paginatedItems = allItems.slice(offset, offset + limit);

    return NextResponse.json({
      news: paginatedItems,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

