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
        ts.id,
        ts.title,
        ts.slug,
        ts.description,
        ts.tutorial_id,
        ts.order_index,
        ts.is_active,
        ts.created_at,
        ts.updated_at,
        t.title as tutorial_title,
        t.slug as tutorial_slug,
        tc.name as category_name,
        (SELECT COUNT(*) FROM tutorial_lessons WHERE section_id = ts.id) as lessons_count
      FROM tutorial_sections ts
      JOIN tutorials t ON ts.tutorial_id = t.id
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      ORDER BY t.order_index, ts.order_index, ts.title
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({ sections: result.rows });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

