import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET() {
  try {
    // Fetch only published courses from database with limited fields for the catalog page
    const { rows } = await pool.query(`
      SELECT 
        c.id, 
        ct.title,
        ct.slug,
        ct.description as short_description,
        ct.featured_image_url as featured_image,
        ct.author_id,
        c.difficulty_level as level,
        c.duration,
        0 as price, -- Placeholder for now
        NULL as discount_price, -- Placeholder for now
        false as is_featured, -- Placeholder for now
        (SELECT u.name FROM users u WHERE u.id = ct.author_id) as author_name,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as section_count,
        (
          SELECT COUNT(*) FROM course_lessons cl 
          JOIN course_modules cm ON cl.module_id = cm.id 
          WHERE cm.course_id = c.id
        ) as lesson_count
      FROM courses c
      JOIN content ct ON c.id = ct.id
      WHERE ct.status = 'published' AND ct.content_type = 'course'
      ORDER BY ct.created_at DESC
    `);

    // Format dates for display
    const courses = rows.map(course => ({
      ...course,
      created_at: course.created_at ? new Date(course.created_at).toISOString() : null,
      updated_at: course.updated_at ? new Date(course.updated_at).toISOString() : null
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
