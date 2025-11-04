import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    
    // Get session (for user verification)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id.toString()) : null;

    // Get attempt
    const attemptResult = await pool.query(
      `SELECT 
        qa.*,
        q.title as quiz_title,
        q.slug as quiz_slug,
        q.passing_score
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = $1`,
      [attemptId]
    );

    if (attemptResult.rows.length === 0) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });
    }

    const attempt = attemptResult.rows[0];

    // Verify ownership (for logged in users)
    if (userId && attempt.user_id !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // If not logged in, check session_id from cookies or request
    if (!userId && attempt.user_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Get responses if attempt is completed
    let responses: any[] = [];
    if (attempt.is_completed) {
      const responsesResult = await pool.query(
        `SELECT 
          qr.*,
          qq.question_text,
          qq.explanation_text,
          qq.related_article_url,
          qq.question_type,
          COALESCE(
            json_agg(
              json_build_object(
                'id', o.id,
                'option_text', o.option_text,
                'is_correct', o.is_correct,
                'order_in_question', o.order_in_question
              ) ORDER BY o.order_in_question
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'
          ) as options
        FROM quiz_responses qr
        JOIN quiz_questions qq ON qr.question_id = qq.id
        LEFT JOIN quiz_question_options o ON qq.id = o.question_id
        WHERE qr.attempt_id = $1
        GROUP BY qr.id, qq.id
        ORDER BY qq.order_in_quiz`,
        [attemptId]
      );

      responses = responsesResult.rows.map(r => ({
        ...r,
        selected_option_ids: Array.isArray(r.selected_option_ids) 
          ? r.selected_option_ids 
          : JSON.parse(r.selected_option_ids || '[]'),
        options: r.options || [],
        created_at: r.created_at ? new Date(r.created_at).toISOString() : null
      }));
    }

    return NextResponse.json({
      attempt: {
        ...attempt,
        start_time: attempt.start_time ? new Date(attempt.start_time).toISOString() : null,
        end_time: attempt.end_time ? new Date(attempt.end_time).toISOString() : null,
        created_at: attempt.created_at ? new Date(attempt.created_at).toISOString() : null,
        passed: attempt.score ? attempt.score >= (attempt.passing_score || 70) : false
      },
      responses
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return NextResponse.json(
      { message: 'Failed to fetch attempt', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

