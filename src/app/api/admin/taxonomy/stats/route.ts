import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch tutorial categories from database directly
    let tutorialCategoriesCount = 0;
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM tutorial_categories 
        WHERE is_active = true
      `);
      tutorialCategoriesCount = parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error fetching tutorial categories:', error);
    }

    // Mock stats data for other content types - replace with actual database queries
    const stats = {
      total_categories: 5 + tutorialCategoriesCount, // 5 mock + tutorial categories
      total_tags: 45,
      categories_by_type: {
        articles: 2, // Linux Basics, System Administration
        courses: 1, // DevOps
        tutorials: tutorialCategoriesCount, // Real tutorial categories
        lab_exercises: 1, // Security
        scripts: 1, // Networking
        tools: 0,
        glossary: 0
      },
      tags_by_type: {
        articles: 18,
        courses: 8,
        tutorials: 0, // Tutorials don't have tags yet
        lab_exercises: 6,
        scripts: 7,
        tools: 4,
        glossary: 2
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching taxonomy stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

