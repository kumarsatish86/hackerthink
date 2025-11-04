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
    // Get all tutorials with their sections and lessons
    const query = `
      SELECT 
        t.id as tutorial_id,
        t.title as tutorial_title,
        t.slug as tutorial_slug,
        t.is_active as tutorial_active,
        ts.id as section_id,
        ts.title as section_title,
        ts.slug as section_slug,
        ts.is_active as section_active,
        tl.id as lesson_id,
        tl.title as lesson_title,
        tl.slug as lesson_slug,
        tl.is_active as lesson_active
      FROM tutorials t
      LEFT JOIN tutorial_sections ts ON t.id = ts.tutorial_id
      LEFT JOIN tutorial_lessons tl ON ts.id = tl.section_id
      WHERE t.is_active = true
      ORDER BY t.order_index, ts.order_index, tl.order_index
    `;
    
    const result = await pool.query(query);
    
    // Group the results by tutorial
    const tutorials = {};
    result.rows.forEach(row => {
      if (!tutorials[row.tutorial_id]) {
        tutorials[row.tutorial_id] = {
          id: row.tutorial_id,
          title: row.tutorial_title,
          slug: row.tutorial_slug,
          is_active: row.tutorial_active,
          sections: {}
        };
      }
      
      if (row.section_id && !tutorials[row.tutorial_id].sections[row.section_id]) {
        tutorials[row.tutorial_id].sections[row.section_id] = {
          id: row.section_id,
          title: row.section_title,
          slug: row.section_slug,
          is_active: row.section_active,
          lessons: []
        };
      }
      
      if (row.lesson_id) {
        tutorials[row.tutorial_id].sections[row.section_id].lessons.push({
          id: row.lesson_id,
          title: row.lesson_title,
          slug: row.lesson_slug,
          is_active: row.lesson_active
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      data: Object.values(tutorials)
    });
  } catch (error) {
    console.error('Error fetching all tutorials:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tutorials', error: error.message },
      { status: 500 }
    );
  }
}

