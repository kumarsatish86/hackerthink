import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

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

    // Retrieve all categories
    const { rows: categories } = await pool.query(
      'SELECT * FROM interview_categories ORDER BY name ASC'
    );

    // Format the categories data
    const formattedCategories = categories.map(category => ({
      ...category,
      created_at: category.created_at ? new Date(category.created_at).toISOString() : null,
      updated_at: category.updated_at ? new Date(category.updated_at).toISOString() : null,
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

