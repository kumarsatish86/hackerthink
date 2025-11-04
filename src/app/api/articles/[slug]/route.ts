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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch article from database
    const { rows } = await pool.query(
      `SELECT 
        a.id, 
        a.title,
        a.slug,
        a.excerpt,
        a.content,
        a.featured_image,
        a.meta_title,
        a.meta_description,
        a.schema_json,
        a.created_at,
        a.updated_at,
        u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = $1 AND a.published = true`,
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    const article = rows[0];

    // Format dates
    article.created_at = new Date(article.created_at).toISOString();
    article.updated_at = new Date(article.updated_at).toISOString();

    // Get related articles (same category or tags if implemented)
    const relatedArticles = await pool.query(
      `SELECT 
        id, 
        title,
        slug,
        excerpt,
        featured_image
      FROM articles
      WHERE published = true 
        AND id != $1
      ORDER BY created_at DESC
      LIMIT 3`,
      [article.id]
    );

    return NextResponse.json({
      article,
      relatedArticles: relatedArticles.rows
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 