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

    // First, get the category from the slug (case-insensitive matching)
    const categoryResult = await pool.query(
      `SELECT id, name, slug FROM news_categories WHERE LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1)`,
      [slug]
    );

    if (categoryResult.rows.length === 0) {
      // Also check the articles categories table for compatibility
      const articleCategoryResult = await pool.query(
        `SELECT id, name, slug FROM categories WHERE LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1)`,
        [slug]
      );
      
      if (articleCategoryResult.rows.length === 0) {
        return NextResponse.json({ 
          news: [],
          pagination: { total: 0, pages: 0, page: 1, limit }
        });
      }
      
      // Use article category and fetch from articles table
      const articleCategory = articleCategoryResult.rows[0];
      
      // Count total articles for this category
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM articles 
         WHERE published = true AND category_id = $1`,
        [articleCategory.id]
      );
      const total = parseInt(countResult.rows[0].count);

      // Fetch articles for this category
      const { rows } = await pool.query(
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
        WHERE a.published = true AND c.id = $1
        ORDER BY a.created_at DESC
        LIMIT $2 OFFSET $3`,
        [articleCategory.id, limit, offset]
      );

      return NextResponse.json({
        news: rows,
        category: articleCategory.name,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
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

