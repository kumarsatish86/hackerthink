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
        t.*,
        tc.name as category_name,
        tc.slug as category_slug,
        COUNT(DISTINCT ts.id) as sections_count,
        COUNT(DISTINCT tl.id) as lessons_count
      FROM tutorials t
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      LEFT JOIN tutorial_sections ts ON t.id = ts.tutorial_id
      LEFT JOIN tutorial_lessons tl ON ts.id = tl.section_id
      WHERE t.is_active = true
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

export async function POST(request: Request) {
  try {
    const { title, slug, description, icon, order_index, category_id } = await request.json();

    if (!title || !slug || !category_id) {
      return NextResponse.json(
        { message: 'Title, slug, and category_id are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTutorial = await pool.query(
      'SELECT id FROM tutorials WHERE slug = $1',
      [slug]
    );

    if (existingTutorial.rows.length > 0) {
      return NextResponse.json(
        { message: 'A tutorial with this slug already exists' },
        { status: 400 }
      );
    }

    // Get category name
    const categoryResult = await pool.query(
      'SELECT name FROM tutorial_categories WHERE id = $1',
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Selected category does not exist' },
        { status: 400 }
      );
    }

    const category_name = categoryResult.rows[0].name;

    // Insert new tutorial
    const result = await pool.query(
      `INSERT INTO tutorials (title, slug, description, icon, order_index, category_id, category_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, slug, description || '', icon || 'linux', order_index || 1, category_id, category_name]
    );

    return NextResponse.json(
      { tutorial: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tutorial:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

