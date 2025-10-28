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
  { params }: { params: { tutorialSlug: string } }
) {
  try {
    const { tutorialSlug } = params;
    console.log('Navigation API called with slug:', tutorialSlug);
    
    // Get the tutorial
    console.log('Querying tutorial with slug:', tutorialSlug);
    const tutorialResult = await pool.query(
      'SELECT id, title, slug FROM tutorials WHERE slug = $1 AND is_active = true',
      [tutorialSlug]
    );
    console.log('Tutorial query result:', tutorialResult.rows);
    
    if (tutorialResult.rows.length === 0) {
      console.log('No tutorial found');
      return NextResponse.json({ message: 'Tutorial not found' }, { status: 404 });
    }
    
    const tutorial = tutorialResult.rows[0];
    console.log('Found tutorial:', tutorial);
    
    // Get sections for this tutorial
    console.log('Querying sections for tutorial_id:', tutorial.id);
    const sectionsResult = await pool.query(
      'SELECT id, title, slug FROM tutorial_sections WHERE tutorial_id = $1 AND is_active = true ORDER BY order_index',
      [tutorial.id]
    );
    
    const sections = sectionsResult.rows;
    console.log('Found sections:', sections);
    
    // Get lessons for each section
    for (const section of sections) {
      console.log('Querying lessons for section:', section.title);
      const lessonsResult = await pool.query(
        'SELECT id, title, slug, estimated_time, difficulty_level FROM tutorial_lessons WHERE section_id = $1 AND is_active = true ORDER BY order_index',
        [section.id]
      );
      section.lessons = lessonsResult.rows;
      console.log(`Lessons for ${section.title}:`, lessonsResult.rows);
    }
    
    const response = {
      success: true,
      data: { tutorial, sections }
    };
    console.log('Sending response:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
