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
    const result = await pool.query(`
      SELECT * FROM tutorial_categories 
      WHERE is_active = true 
      ORDER BY order_index, name
    `);
    
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, description, order_index } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await pool.query(
      'SELECT id FROM tutorial_categories WHERE slug = $1',
      [slug]
    );

    if (existingCategory.rows.length > 0) {
      return NextResponse.json(
        { message: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO tutorial_categories (name, slug, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, description || '', order_index || 1]
    );

    return NextResponse.json(
      { category: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

