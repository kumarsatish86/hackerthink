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
  { params }: { params: Promise<{ lessonSlug: string }> }
) {
  try {
    const { lessonSlug } = await params;
    
    const result = await pool.query(`
      SELECT l.*, s.title as section_title, s.slug as section_slug,
             t.title as module_title, t.slug as module_slug,
             tc.name as category_name
      FROM tutorial_lessons l
      JOIN tutorial_sections s ON l.section_id = s.id
      JOIN tutorials t ON s.tutorial_id = t.id
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      WHERE l.slug = $1 AND l.is_active = true
    `, [lessonSlug]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    const lessonData = result.rows[0];
    
    // Debug: Log structured data
    console.log('Lesson API - structured_data field:', {
      hasStructuredData: !!lessonData.structured_data,
      structuredDataLength: lessonData.structured_data?.length || 0,
      structuredDataPreview: lessonData.structured_data?.substring(0, 100) + '...'
    });
    
    return NextResponse.json({ 
      success: true, 
      data: lessonData 
    });
  } catch (error) {
    console.error('Error fetching tutorial lesson:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tutorial lesson' },
      { status: 500 }
    );
  }
}
