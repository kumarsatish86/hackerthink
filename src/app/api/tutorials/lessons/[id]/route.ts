import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Lesson API GET - Received ID:', id);
    
    // Test database connection first
    try {
      await pool.query('SELECT 1');
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed', error: String(dbError) },
        { status: 500 }
      );
    }
    
    console.log('Executing lesson query for ID:', id);
    const result = await pool.query(`
      SELECT tl.*, ts.title as section_title, ts.slug as section_slug,
             t.title as tutorial_title, t.slug as tutorial_slug,
             tc.name as category_name
      FROM tutorial_lessons tl
      JOIN tutorial_sections ts ON tl.section_id = ts.id
      JOIN tutorials t ON ts.tutorial_id = t.id
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      WHERE tl.id = $1
    `, [id]);
    
    console.log('Query result rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No lesson found with ID:', id);
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    const lessonData = result.rows[0];
    console.log('Lesson data found:', {
      id: lessonData.id,
      title: lessonData.title,
      section_id: lessonData.section_id,
      section_title: lessonData.section_title,
      tutorial_title: lessonData.tutorial_title
    });
    
    // Debug: Log structured data
    console.log('Lesson API [id] - structured_data field:', {
      hasStructuredData: !!lessonData.structured_data,
      structuredDataLength: lessonData.structured_data?.length || 0,
      structuredDataPreview: typeof lessonData.structured_data === 'string' 
        ? lessonData.structured_data.substring(0, 100) + '...'
        : 'Not a string'
    });
    
    return NextResponse.json({ lesson: lessonData });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { 
      title, slug, excerpt, content, section_id, estimated_time, difficulty_level, order_index, is_active,
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

    // Check if slug already exists in this section (excluding current lesson)
    const existingLesson = await pool.query(
      'SELECT id FROM tutorial_lessons WHERE section_id = $1 AND slug = $2 AND id != $3',
      [section_id, slug, id]
    );

    if (existingLesson.rows.length > 0) {
      return NextResponse.json(
        { message: 'A lesson with this slug already exists in this section' },
        { status: 400 }
      );
    }

    // Update lesson
    const result = await pool.query(
      `UPDATE tutorial_lessons 
       SET title = $1, slug = $2, excerpt = $3, content = $4, section_id = $5, estimated_time = $6, difficulty_level = $7, order_index = $8, is_active = $9, 
            meta_title = $10, meta_description = $11, meta_keywords = $12, canonical_url = $13,
            og_title = $14, og_description = $15, og_image = $16,
            twitter_title = $17, twitter_description = $18, twitter_image = $19,
            structured_data = $20, reading_time = $21, updated_at = NOW()
       WHERE id = $22
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
        is_active !== undefined ? is_active : true,
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
        reading_time || estimated_time || 15,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if lesson exists
    const lessonExists = await pool.query(
      'SELECT id, title FROM tutorial_lessons WHERE id = $1',
      [id]
    );

    if (lessonExists.rows.length === 0) {
      return NextResponse.json(
        { message: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Delete the lesson
    const result = await pool.query(
      'DELETE FROM tutorial_lessons WHERE id = $1 RETURNING *',
      [id]
    );

    return NextResponse.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
