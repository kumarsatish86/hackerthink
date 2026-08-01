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
    const tableCheck = await pool.query(
      `SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'quiz_categories'
       LIMIT 1`
    );

    if (tableCheck.rows.length === 0) {
      return NextResponse.json({ categories: [] });
    }

    const slugCheck = await pool.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'quizzes'
         AND column_name = 'slug'
       LIMIT 1`
    );

    if (slugCheck.rows.length === 0) {
      const { rows: categories } = await pool.query(
        `SELECT id, name, slug, description, 0::int as quiz_count
         FROM quiz_categories
         ORDER BY name ASC`
      );
      return NextResponse.json({
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          quiz_count: 0,
        })),
      });
    }

    const { rows: categories } = await pool.query(
      `SELECT 
        qc.*,
        COUNT(DISTINCT q.id) as quiz_count
      FROM quiz_categories qc
      LEFT JOIN quiz_category_assignments qca ON qc.id = qca.category_id
      LEFT JOIN quizzes q ON qca.quiz_id = q.id AND q.status = 'published'
      GROUP BY qc.id
      ORDER BY qc.name ASC`
    );

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      quiz_count: parseInt(category.quiz_count) || 0,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        categories: [],
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}
