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

    // Fetch guest from database
    const { rows: guestRows } = await pool.query(
      'SELECT * FROM interview_guests WHERE slug = $1',
      [slug]
    );

    if (guestRows.length === 0) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    }

    const guest = guestRows[0];

    // Calculate total interviews for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM interviews WHERE guest_id = $1 AND status = $2',
      [guest.id, 'published']
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch all published interviews for this guest
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
        c.name as category_name,
        c.slug as category_slug
      FROM interviews i
      LEFT JOIN interview_categories c ON i.category_id = c.id
      WHERE i.guest_id = $1 AND i.status = 'published'
      ORDER BY i.publish_date DESC NULLS LAST, i.created_at DESC
      LIMIT $2 OFFSET $3`,
      [guest.id, limit, offset]
    );

    // Format guest data
    guest.created_at = guest.created_at ? new Date(guest.created_at).toISOString() : null;
    guest.updated_at = guest.updated_at ? new Date(guest.updated_at).toISOString() : null;
    guest.social_links = guest.social_links || {};

    // Format interviews
    const formattedInterviews = interviews.map(interview => ({
      ...interview,
      created_at: interview.created_at ? new Date(interview.created_at).toISOString() : null,
      publish_date: interview.publish_date ? new Date(interview.publish_date).toISOString() : null,
    }));

    return NextResponse.json({
      guest,
      interviews: formattedInterviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching guest interviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

