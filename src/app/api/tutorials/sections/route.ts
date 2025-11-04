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
      WHERE ts.is_active = true
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

export async function POST(request: Request) {
  try {
    const { title, slug, description, tutorial_id, order_index } = await request.json();

    if (!title || !slug || !tutorial_id) {
      return NextResponse.json(
        { message: 'Title, slug, and tutorial_id are required' },
        { status: 400 }
      );
    }

    // Check if tutorial exists
    const tutorialExists = await pool.query(
      'SELECT id FROM tutorials WHERE id = $1',
      [tutorial_id]
    );

    if (tutorialExists.rows.length === 0) {
      return NextResponse.json(
        { message: 'Selected tutorial does not exist' },
        { status: 400 }
      );
    }

    // Check if slug already exists in this tutorial
    const existingSection = await pool.query(
      'SELECT id FROM tutorial_sections WHERE tutorial_id = $1 AND slug = $2',
      [tutorial_id, slug]
    );

    if (existingSection.rows.length > 0) {
      return NextResponse.json(
        { message: 'A section with this slug already exists in this tutorial' },
        { status: 400 }
      );
    }

    // Insert new section
    const result = await pool.query(
      `INSERT INTO tutorial_sections (title, slug, description, tutorial_id, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, slug, description || '', tutorial_id, order_index || 1]
    );

    return NextResponse.json(
      { section: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

