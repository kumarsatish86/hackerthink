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

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Fetch category from database
    const { rows: categoryRows } = await pool.query(
      'SELECT * FROM interview_categories WHERE slug = $1',
      [slug]
    );

    if (categoryRows.length === 0) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const category = categoryRows[0];

    // Calculate total interviews for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM interviews WHERE category_id = $1 AND status = $2',
      [category.id, 'published']
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch all published interviews for this category
    const { rows: interviews } = await pool.query(
      `SELECT 
        i.id,
        i.title,
        i.slug,
        i.excerpt,
        i.featured_image,
        i.featured_image_alt,
        i.interview_type,
        i.featured,
        i.view_count,
        i.publish_date,
        i.created_at,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo,
        g.title as guest_title,
        g.company as guest_company
      FROM interviews i
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      WHERE i.category_id = $1 AND i.status = 'published'
      ORDER BY i.publish_date DESC NULLS LAST, i.created_at DESC
      LIMIT $2 OFFSET $3`,
      [category.id, limit, offset]
    );

    // Format category data
    category.created_at = category.created_at ? new Date(category.created_at).toISOString() : null;
    category.updated_at = category.updated_at ? new Date(category.updated_at).toISOString() : null;

    // Format interviews
    const formattedInterviews = interviews.map(interview => ({
      ...interview,
      created_at: interview.created_at ? new Date(interview.created_at).toISOString() : null,
      publish_date: interview.publish_date ? new Date(interview.publish_date).toISOString() : null,
    }));

    return NextResponse.json({
      category,
      interviews: formattedInterviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching category interviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

