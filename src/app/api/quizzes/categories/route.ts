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
    // Get all categories with quiz counts (only published quizzes)
    const { rows: categories } = await pool.query(
      `SELECT 
        qc.*,
        COUNT(DISTINCT q.id) as quiz_count
      FROM quiz_categories qc
      LEFT JOIN quiz_category_assignments qca ON qc.id = qca.category_id
      LEFT JOIN quizzes q ON qca.quiz_id = q.id AND q.status = 'published'
      GROUP BY qc.id
      HAVING COUNT(DISTINCT q.id) > 0
      ORDER BY qc.name ASC`
    );

    // Format the categories data
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      quiz_count: parseInt(category.quiz_count) || 0
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

