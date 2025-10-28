import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Fix the warning by properly awaiting params
    const { slug } = await params;

    // Fetch the lab exercise
    const { rows } = await pool.query(
      `SELECT 
        e.id, 
        e.title,
        e.slug,
        e.description,
        e.content,
        e.instructions,
        e.solution,
        e.difficulty,
        e.duration,
        e.prerequisites,
        e.related_course_id,
        e.featured_image,
        e.meta_title,
        e.meta_description,
        e.schema_json,
        e.created_at,
        e.updated_at,
        u.name as author_name
      FROM lab_exercises e
      LEFT JOIN users u ON CAST(e.author_id AS TEXT) = CAST(u.id AS TEXT)
      WHERE e.slug = $1 AND e.published = true`,
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Lab exercise not found' }, { status: 404 });
    }

    const labExercise = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString()
    };

    // If there's a related course, fetch the course details
    let relatedCourse = null;
    if (labExercise.related_course_id) {
      const courseResult = await pool.query(
        `SELECT id, title, slug, short_description, featured_image
         FROM courses
         WHERE id = $1 AND published = true`,
        [labExercise.related_course_id]
      );

      if (courseResult.rows.length > 0) {
        relatedCourse = courseResult.rows[0];
      }
    }

    return NextResponse.json({ 
      lab_exercise: labExercise,
      related_course: relatedCourse
    });
  } catch (error) {
    console.error('Error fetching lab exercise:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 