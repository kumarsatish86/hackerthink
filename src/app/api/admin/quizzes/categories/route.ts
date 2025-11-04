import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import slugify from 'slugify';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Retrieve all categories with quiz counts
    const { rows: categories } = await pool.query(
      `SELECT 
        qc.*,
        COUNT(DISTINCT qca.quiz_id) as quiz_count
      FROM quiz_categories qc
      LEFT JOIN quiz_category_assignments qca ON qc.id = qca.category_id
      GROUP BY qc.id
      ORDER BY qc.name ASC`
    );

    // Format the categories data
    const formattedCategories = categories.map(category => ({
      ...category,
      quiz_count: parseInt(category.quiz_count) || 0,
      created_at: category.created_at ? new Date(category.created_at).toISOString() : null
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, slug, description } = await request.json();

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    let finalSlug = slug || slugify(name, { lower: true, strict: true });
    
    // Ensure slug is unique
    let slugCheck = await pool.query('SELECT id FROM quiz_categories WHERE slug = $1', [finalSlug]);
    let slugCounter = 1;
    const originalSlug = finalSlug;
    while (slugCheck.rows.length > 0) {
      finalSlug = `${originalSlug}-${slugCounter}`;
      slugCheck = await pool.query('SELECT id FROM quiz_categories WHERE slug = $1', [finalSlug]);
      slugCounter++;
    }

    // Insert category
    const result = await pool.query(
      `INSERT INTO quiz_categories (name, slug, description, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, finalSlug, description || null]
    );

    const newCategory = result.rows[0];

    return NextResponse.json(
      { 
        message: 'Category created successfully',
        category: {
          ...newCategory,
          created_at: newCategory.created_at ? new Date(newCategory.created_at).toISOString() : null,
          quiz_count: 0
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

