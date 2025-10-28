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

