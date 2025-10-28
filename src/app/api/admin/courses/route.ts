import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch courses from database
    const { rows } = await pool.query(`
      SELECT 
        c.id, 
        ct.title,
        ct.slug,
        ct.description as short_description,
        ct.status as published,
        ct.author_id,
        ct.featured_image_url,
        ct.created_at,
        ct.updated_at,
        c.duration,
        c.difficulty_level as level,
        c.prerequisites,
        c.learning_objectives,
        u.name as author_name,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as section_count,
        (
          SELECT COUNT(*) FROM course_lessons cl 
          JOIN course_modules cm ON cl.module_id = cm.id 
          WHERE cm.course_id = c.id
        ) as lesson_count
      FROM courses c
      JOIN content ct ON c.id = ct.id
      LEFT JOIN users u ON ct.author_id = u.id
      ORDER BY ct.created_at DESC
    `);

    // Format dates for display
    const courses = rows.map(course => ({
      ...course,
      created_at: new Date(course.created_at).toISOString(),
      updated_at: new Date(course.updated_at).toISOString(),
      published: course.published === 'published'
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

export async function POST(request: NextRequest) {
  try {
    console.log('Creating new course - started');
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { 
      title, 
      slug, 
      short_description, 
      content,
      level = 'Beginner',
      duration = 0,
      price = 0,
      discount_price = null,
      prerequisites = null
    } = await request.json();
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }
    
    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    }
    
    // Get author ID
    const authorId = session.user?.id;
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      return NextResponse.json(
        { message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }
    
    // Begin transaction to insert into both content and courses tables
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert into content table first
      const contentResult = await client.query(
        `INSERT INTO content (
          title, 
          slug, 
          description, 
          content_type,
          status,
          author_id,
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, title, slug, description, content_type, status, author_id, created_at, updated_at`,
        [title, finalSlug, short_description || null, 'course', 'published', authorId]
      );

      const contentId = contentResult.rows[0].id;

      // Insert into courses table using the same ID
      const courseResult = await client.query(
        `INSERT INTO courses (
          id,
          difficulty_level,
          duration,
          prerequisites
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, difficulty_level, duration, prerequisites`,
        [contentId, level, duration, prerequisites]
      );

      await client.query('COMMIT');

      const newCourse = {
        ...contentResult.rows[0],
        ...courseResult.rows[0],
        level: courseResult.rows[0].difficulty_level,
        published: contentResult.rows[0].status === 'published',
        section_count: 0,
        lesson_count: 0,
        created_at: new Date(contentResult.rows[0].created_at).toISOString(),
        updated_at: new Date(contentResult.rows[0].updated_at).toISOString()
      };

      return NextResponse.json(
        { message: 'Course created successfully', course: newCourse },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    // Check for unique constraint violation (duplicate slug)
    if (error.code === '23505') {
      return NextResponse.json(
        { message: 'A course with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.toString() },
      { status: 500 }
    );
  }
} 
