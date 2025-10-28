import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Calculate total articles for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM articles WHERE published = true'
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch published articles from database
    const { rows } = await pool.query(
      `SELECT 
        a.id, 
        a.title,
        a.slug,
        a.excerpt,
        a.featured_image,
        a.created_at,
        a.updated_at,
        u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.published = true
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Format dates for display
    const articles = rows.map(article => ({
      ...article,
      created_at: new Date(article.created_at).toISOString(),
      updated_at: new Date(article.updated_at).toISOString()
    }));

    return NextResponse.json({ 
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
