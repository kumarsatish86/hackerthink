import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all interviews with related data
    const { rows: interviews } = await pool.query(`
      SELECT 
        i.*,
        u.name as interviewer_name,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo,
        c.name as category_name
      FROM interviews i
      LEFT JOIN users u ON i.interviewer_id = u.id
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      LEFT JOIN interview_categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `);

    // Format the interviews data
    const formattedInterviews = interviews.map(interview => ({
      ...interview,
      created_at: interview.created_at ? new Date(interview.created_at).toISOString() : null,
      updated_at: interview.updated_at ? new Date(interview.updated_at).toISOString() : null,
      publish_date: interview.publish_date ? new Date(interview.publish_date).toISOString() : null,
      schedule_date: interview.schedule_date ? new Date(interview.schedule_date).toISOString() : null,
      content: interview.content || {},
      tags: Array.isArray(interview.tags) ? interview.tags : []
    }));

    return NextResponse.json({ interviews: formattedInterviews });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({
      message: 'Failed to fetch interviews',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      guest_id,
      category_id,
      interview_type = 'text',
      featured_image,
      featured_image_alt,
      meta_title,
      meta_description,
      seo_keywords,
      schema_json,
      tags,
      status = 'draft',
      featured = false,
      schedule_date
    } = await request.json();

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

    // Check if slug already exists
    const existingSlug = await pool.query(
      'SELECT * FROM interviews WHERE slug = $1',
      [finalSlug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { message: 'Interview with this slug already exists' },
        { status: 409 }
      );
    }

    // Determine the interviewer ID (use session user's ID)
    const finalInterviewerId = session.user?.id || null;

    // Insert interview into database
    const result = await pool.query(
      `INSERT INTO interviews (
        title,
        slug,
        excerpt,
        content,
        interviewer_id,
        guest_id,
        category_id,
        interview_type,
        featured_image,
        featured_image_alt,
        meta_title,
        meta_description,
        seo_keywords,
        schema_json,
        tags,
        status,
        featured,
        schedule_date,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        title,
        finalSlug,
        excerpt || null,
        JSON.stringify(content || {}),
        finalInterviewerId,
        guest_id || null,
        category_id || null,
        interview_type,
        featured_image || null,
        featured_image_alt || null,
        meta_title || null,
        meta_description || null,
        seo_keywords || null,
        schema_json ? JSON.stringify(schema_json) : null,
        tags ? JSON.stringify(tags) : '[]',
        status,
        featured,
        schedule_date || null
      ]
    );

    const newInterview = result.rows[0];

    // If status is published, set publish_date
    if (status === 'published' && !newInterview.publish_date) {
      await pool.query(
        'UPDATE interviews SET publish_date = CURRENT_TIMESTAMP WHERE id = $1',
        [newInterview.id]
      );
      newInterview.publish_date = new Date().toISOString();
    }

    return NextResponse.json(
      { message: 'Interview created successfully', interview: newInterview },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

