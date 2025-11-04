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
    // First get all active tutorials
    const tutorialsQuery = `
      SELECT 
        t.id, t.title, t.slug, t.description, t.icon, t.order_index,
        tc.name as category_name, tc.slug as category_slug
      FROM tutorials t
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      WHERE t.is_active = true
      ORDER BY t.order_index, t.title
    `;
    
    const tutorialsResult = await pool.query(tutorialsQuery);
    const tutorials = tutorialsResult.rows;
    
    // For each tutorial, get its sections
    for (const tutorial of tutorials) {
      const sectionsQuery = `
        SELECT 
          ts.id, ts.title, ts.slug, ts.description, ts.order_index
        FROM tutorial_sections ts
        WHERE ts.tutorial_id = $1 AND ts.is_active = true
        ORDER BY ts.order_index, ts.title
      `;
      
      const sectionsResult = await pool.query(sectionsQuery, [tutorial.id]);
      tutorial.sections = sectionsResult.rows;
      
      // For each section, get its lessons
      for (const section of tutorial.sections) {
        const lessonsQuery = `
          SELECT 
            tl.id, tl.title, tl.slug, tl.excerpt, tl.estimated_time, 
            tl.difficulty_level, tl.order_index
          FROM tutorial_lessons tl
          WHERE tl.section_id = $1 AND tl.is_active = true
          ORDER BY tl.order_index, tl.title
        `;
        
        const lessonsResult = await pool.query(lessonsQuery, [section.id]);
        section.lessons = lessonsResult.rows;
      }
    }
    
    // Return in the format expected by the frontend
    return NextResponse.json({ 
      success: true,
      data: tutorials,
      tutorials: tutorials // Also include this for backward compatibility
    });
  } catch (error) {
    console.error('Error fetching tutorials navigation:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch tutorial navigation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

