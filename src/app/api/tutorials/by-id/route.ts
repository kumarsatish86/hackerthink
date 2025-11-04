import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const result = await pool.query(`
      SELECT t.*, tc.name as category_name, tc.slug as category_slug
      FROM tutorials t
      LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Tutorial not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tutorial: result.rows[0] });
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const { title, slug, description, icon, order_index, is_active, category_id } = await request.json();

    if (!title || !slug || !category_id) {
      return NextResponse.json(
        { message: 'Title, slug, and category_id are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current tutorial)
    const existingTutorial = await pool.query(
      'SELECT id FROM tutorials WHERE slug = $1 AND id != $2',
      [slug, id]
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

    // Update tutorial
    const result = await pool.query(
      `UPDATE tutorials 
       SET title = $1, slug = $2, description = $3, icon = $4, order_index = $5, 
           is_active = $6, category_id = $7, category_name = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, slug, description || '', icon || 'linux', order_index || 1, 
       is_active !== undefined ? is_active : true, category_id, category_name, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tutorial: result.rows[0] });
  } catch (error) {
    console.error('Error updating tutorial:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

