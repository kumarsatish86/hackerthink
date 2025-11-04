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
        t.*,
        tc.name as category_name,
        tc.slug as category_slug,
        COUNT(DISTINCT ts.id) as sections_count,
        COUNT(DISTINCT tl.id) as lessons_count
      FROM tutorials t
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      LEFT JOIN tutorial_sections ts ON t.id = ts.tutorial_id
      LEFT JOIN tutorial_lessons tl ON ts.id = tl.section_id
      GROUP BY t.id, tc.name, tc.slug
      ORDER BY t.order_index, t.title
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({ tutorials: result.rows });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

