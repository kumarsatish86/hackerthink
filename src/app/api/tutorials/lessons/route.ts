import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET() {
  try {
    const query = `
      SELECT 
        tl.*,
        ts.title as section_title,
        ts.slug as section_slug,
        t.title as tutorial_title,
        t.slug as tutorial_slug,
        tc.name as category_name
      FROM tutorial_lessons tl
      JOIN tutorial_sections ts ON tl.section_id = ts.id
      JOIN tutorials t ON ts.tutorial_id = t.id
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      WHERE tl.is_active = true
      ORDER BY t.order_index, ts.order_index, tl.order_index, tl.title
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({ lessons: result.rows });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      title, slug, excerpt, content, section_id, estimated_time, difficulty_level, order_index,
      meta_title, meta_description, meta_keywords, canonical_url,
      og_title, og_description, og_image,
      twitter_title, twitter_description, twitter_image,
      structured_data, reading_time
    } = await request.json();

    if (!title || !slug || !content || !section_id) {
      return NextResponse.json(
        { message: 'Title, slug, content, and section_id are required' },
        { status: 400 }
      );
    }

    // Check if section exists
    const sectionExists = await pool.query(
      'SELECT id FROM tutorial_sections WHERE id = $1',
      [section_id]
    );

    if (sectionExists.rows.length === 0) {
      return NextResponse.json(
        { message: 'Selected section does not exist' },
        { status: 400 }
      );
    }

    // Check if slug already exists in this section
    const existingLesson = await pool.query(
      'SELECT id FROM tutorial_lessons WHERE section_id = $1 AND slug = $2',
      [section_id, slug]
    );

    if (existingLesson.rows.length > 0) {
      return NextResponse.json(
        { message: 'A lesson with this slug already exists in this section' },
        { status: 400 }
      );
    }

    // Insert new lesson
    const result = await pool.query(
      `INSERT INTO tutorial_lessons (
        title, slug, excerpt, content, section_id, estimated_time, difficulty_level, order_index,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image,
        twitter_title, twitter_description, twitter_image,
        structured_data, reading_time
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        title, 
        slug, 
        excerpt || '', 
        content, 
        section_id, 
        estimated_time || 15, 
        difficulty_level || 'beginner', 
        order_index || 1,
        meta_title || title,
        meta_description || excerpt || '',
        meta_keywords || '',
        canonical_url || '',
        og_title || title,
        og_description || excerpt || '',
        og_image || '',
        twitter_title || title,
        twitter_description || excerpt || '',
        twitter_image || '',
        structured_data || null,
        reading_time || estimated_time || 15
      ]
    );

    return NextResponse.json(
      { lesson: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

