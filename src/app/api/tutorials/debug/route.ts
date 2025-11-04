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
    console.log('=== DEBUG ENDPOINT CALLED ===');
    
    // Test database connection
    let dbStatus = 'Unknown';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'Connected';
      console.log('Database connection successful');
    } catch (dbError) {
      dbStatus = `Failed: ${dbError.message}`;
      console.error('Database connection failed:', dbError);
    }
    
    // Get all tutorials
    let tutorials = [];
    try {
      const result = await pool.query('SELECT id, title, slug, is_active FROM tutorials ORDER BY order_index');
      tutorials = result.rows;
      console.log('Tutorials found:', tutorials);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    }
    
    // Get all sections
    let sections = [];
    try {
      const result = await pool.query('SELECT id, title, slug, tutorial_id, is_active FROM tutorial_sections ORDER BY order_index');
      sections = result.rows;
      console.log('Sections found:', sections);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
    
    // Get all lessons
    let lessons = [];
    try {
      const result = await pool.query('SELECT id, title, slug, section_id, is_active FROM tutorial_lessons ORDER BY order_index');
      lessons = result.rows;
      console.log('Lessons found:', lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        user: process.env.DB_USER || 'postgres',
        database: process.env.DB_NAME || 'hackerthink'
      },
      data: {
        tutorials,
        sections,
        lessons
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { message: 'Debug endpoint failed', error: error.message },
      { status: 500 }
    );
  }
}

