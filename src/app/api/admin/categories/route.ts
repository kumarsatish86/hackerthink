import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Function to ensure categories table exists
async function ensureCategoriesTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add a General category if none exists
    const { rows } = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO categories (name, slug) VALUES ($1, $2)',
        ['General', 'general']
      );
    }
  } catch (error) {
    console.error('Error ensuring categories table exists:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureCategoriesTableExists();
    
    // Check if user is authenticated (optional)
    const session = await getServerSession();
    
    // If you want this to be admin-only, uncomment this
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch categories from database
    const { rows } = await pool.query(
      `SELECT id, name FROM categories ORDER BY name ASC`
    );

    return NextResponse.json({ categories: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureCategoriesTableExists();
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate a slug from the name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with a single one
      .trim();

    // Check if category with this name already exists
    const existing = await pool.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Insert new category with a slug
    const { rows } = await pool.query(
      'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name',
      [name, slug]
    );

    return NextResponse.json({
      message: 'Category created successfully',
      category: rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
