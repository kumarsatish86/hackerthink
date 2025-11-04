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

    // Fetch interview from database
    const { rows } = await pool.query(
      `SELECT 
        i.*,
        u.name as interviewer_name,
        g.id as guest_id,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo,
        g.bio as guest_bio,
        g.title as guest_title,
        g.company as guest_company,
        g.company_url as guest_company_url,
        g.designation as guest_designation,
        g.social_links as guest_social_links,
        g.bio_summary as guest_bio_summary,
        g.verified as guest_verified,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM interviews i
      LEFT JOIN users u ON i.interviewer_id = u.id
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      LEFT JOIN interview_categories c ON i.category_id = c.id
      WHERE i.slug = $1 AND i.status = 'published'`,
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
    }

    const interview = rows[0];

    // Increment view count
    await pool.query(
      'UPDATE interviews SET view_count = view_count + 1 WHERE id = $1',
      [interview.id]
    );

    // Format dates
    interview.created_at = interview.created_at ? new Date(interview.created_at).toISOString() : null;
    interview.updated_at = interview.updated_at ? new Date(interview.updated_at).toISOString() : null;
    interview.publish_date = interview.publish_date ? new Date(interview.publish_date).toISOString() : null;
    interview.schedule_date = interview.schedule_date ? new Date(interview.schedule_date).toISOString() : null;
    interview.content = interview.content || {};
    interview.tags = Array.isArray(interview.tags) ? interview.tags : [];
    interview.guest_social_links = interview.guest_social_links || {};

    // Get related interviews (same category or same guest)
    const relatedInterviews = await pool.query(
      `SELECT 
        i.id,
        i.title,
        i.slug,
        i.excerpt,
        i.featured_image,
        i.publish_date,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo
      FROM interviews i
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      WHERE i.status = 'published' 
        AND i.id != $1
        AND (i.category_id = $2 OR i.guest_id = $3)
      ORDER BY i.publish_date DESC
      LIMIT 3`,
      [interview.id, interview.category_id || null, interview.guest_id || null]
    );

    // Format related interviews
    const formattedRelated = relatedInterviews.rows.map(rel => ({
      ...rel,
      publish_date: rel.publish_date ? new Date(rel.publish_date).toISOString() : null,
    }));

    return NextResponse.json({
      interview,
      relatedInterviews: formattedRelated
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

