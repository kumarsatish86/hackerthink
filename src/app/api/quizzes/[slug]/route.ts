import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get quiz details (only published)
    const quizResult = await pool.query(
      `SELECT 
        q.*,
        COUNT(DISTINCT qq.id) as question_count,
        ARRAY_AGG(DISTINCT qc.name) FILTER (WHERE qc.name IS NOT NULL) as category_names,
        ARRAY_AGG(DISTINCT qc.slug) FILTER (WHERE qc.slug IS NOT NULL) as category_slugs
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      LEFT JOIN quiz_category_assignments qca ON q.id = qca.quiz_id
      LEFT JOIN quiz_categories qc ON qca.category_id = qc.id
      WHERE q.slug = $1 AND q.status = 'published'
      GROUP BY q.id`,
      [slug]
    );

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];

    // Format the response
    const formattedQuiz = {
      ...quiz,
      created_at: quiz.created_at ? new Date(quiz.created_at).toISOString() : null,
      updated_at: quiz.updated_at ? new Date(quiz.updated_at).toISOString() : null,
      question_count: parseInt(quiz.question_count) || 0,
      category_names: quiz.category_names || [],
      category_slugs: quiz.category_slugs || []
    };

    return NextResponse.json({ quiz: formattedQuiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { message: 'Failed to fetch quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

