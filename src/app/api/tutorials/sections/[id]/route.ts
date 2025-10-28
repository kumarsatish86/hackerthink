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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const result = await pool.query(`
      SELECT ts.*, t.title as tutorial_title, t.slug as tutorial_slug
      FROM tutorial_sections ts
      JOIN tutorials t ON ts.tutorial_id = t.id
      WHERE ts.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ section: result.rows[0] });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, slug, description, tutorial_id, order_index, is_active } = await request.json();

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

    // Check if slug already exists in this tutorial (excluding current section)
    const existingSection = await pool.query(
      'SELECT id FROM tutorial_sections WHERE tutorial_id = $1 AND slug = $2 AND id != $3',
      [tutorial_id, slug, id]
    );

    if (existingSection.rows.length > 0) {
      return NextResponse.json(
        { message: 'A section with this slug already exists in this tutorial' },
        { status: 400 }
      );
    }

    // Update section
    const result = await pool.query(
      `UPDATE tutorial_sections 
       SET title = $1, slug = $2, description = $3, tutorial_id = $4, order_index = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, slug, description || '', tutorial_id, order_index || 1, is_active !== undefined ? is_active : true, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ section: result.rows[0] });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if section exists
    const sectionExists = await pool.query(
      'SELECT id, title FROM tutorial_sections WHERE id = $1',
      [id]
    );

    if (sectionExists.rows.length === 0) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }

    // Check if section has lessons
    const lessonsCount = await pool.query(
      'SELECT COUNT(*) FROM tutorial_lessons WHERE section_id = $1',
      [id]
    );

    if (parseInt(lessonsCount.rows[0].count) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete section that has lessons. Please delete or reassign lessons first.' },
        { status: 400 }
      );
    }

    // Delete the section
    const result = await pool.query(
      'DELETE FROM tutorial_sections WHERE id = $1 RETURNING *',
      [id]
    );

    return NextResponse.json({ section: result.rows[0] });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
