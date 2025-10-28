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
    
    const result = await pool.query(
      'SELECT * FROM tutorial_categories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
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
    const { name, slug, description, order_index } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists for other categories
    const existingCategory = await pool.query(
      'SELECT id FROM tutorial_categories WHERE slug = $1 AND id != $2',
      [slug, id]
    );

    if (existingCategory.rows.length > 0) {
      return NextResponse.json(
        { message: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE tutorial_categories 
       SET name = $1, slug = $2, description = $3, order_index = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, slug, description || '', order_index || 1, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Error updating category:', error);
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

    // Check if category has tutorials
    const tutorialsCount = await pool.query(
      'SELECT COUNT(*) FROM tutorials WHERE category_id = $1',
      [id]
    );

    if (parseInt(tutorialsCount.rows[0].count) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category that has tutorials. Please reassign or delete tutorials first.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM tutorial_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
