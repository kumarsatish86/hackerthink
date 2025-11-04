import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Retrieve all categories with interview count
    const { rows: categories } = await pool.query(
      `SELECT 
        c.*,
        COUNT(i.id) as interview_count
      FROM interview_categories c
      LEFT JOIN interviews i ON c.id = i.category_id AND i.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC`
    );

    // Format the categories data
    const formattedCategories = categories.map(category => ({
      ...category,
      created_at: category.created_at ? new Date(category.created_at).toISOString() : null,
      updated_at: category.updated_at ? new Date(category.updated_at).toISOString() : null,
      interview_count: parseInt(category.interview_count) || 0,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

