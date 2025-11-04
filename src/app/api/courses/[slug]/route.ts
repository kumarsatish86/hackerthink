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
    const slug = params.slug;

    // Fetch course details using the content and courses tables
    const courseResult = await pool.query(
      `SELECT 
         c.id, 
         ct.title,
         ct.slug,
         ct.description as short_description,
         ct.description as description,
         '' as requirements,
         '' as what_will_learn,
         '' as who_is_for,
         ct.featured_image_url as featured_image,
         ct.author_id,
         c.difficulty_level as level,
         c.duration,
         0 as price,
         NULL as discount_price,
         false as is_featured,
         ct.created_at,
         ct.updated_at,
         (SELECT u.name FROM users u WHERE u.id = ct.author_id) as author_name
       FROM courses c
       JOIN content ct ON c.id = ct.id
       WHERE ct.slug = $1 AND ct.status = 'published' AND ct.content_type = 'course'`,
      [slug]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found or not published' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Fetch sections using course_modules table
    const sectionsResult = await pool.query(
      `SELECT 
         id, 
         title,
         description,
         order_index
       FROM course_modules 
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [course.id]
    );

    const sections = sectionsResult.rows;

    // Fetch chapters for each section (using course_lessons table)
    for (const section of sections) {
      const chaptersResult = await pool.query(
        `SELECT 
           id,
           title,
           COALESCE(NULLIF(video_url, ''), 'text') as content_type,
           duration,
           false as is_free_preview,
           order_index
         FROM course_lessons
         WHERE module_id = $1
         ORDER BY order_index ASC`,
        [section.id]
      );
      
      section.chapters = chaptersResult.rows;
    }

    // We'll skip reviews for now since that table might not exist
    const reviewStats = { review_count: 0, average_rating: 0 };

    const courseDetails = {
      ...course,
      sections,
      review_count: reviewStats.review_count,
      average_rating: reviewStats.average_rating,
      created_at: course.created_at ? new Date(course.created_at).toISOString() : null,
      updated_at: course.updated_at ? new Date(course.updated_at).toISOString() : null
    };

    return NextResponse.json({ course: courseDetails });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 