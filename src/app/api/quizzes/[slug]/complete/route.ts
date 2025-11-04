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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { attempt_id } = await request.json();

    if (!attempt_id) {
      return NextResponse.json(
        { message: 'attempt_id is required' },
        { status: 400 }
      );
    }

    // Check if attempt exists
    const attemptCheck = await pool.query(
      'SELECT id, quiz_id, start_time, is_completed FROM quiz_attempts WHERE id = $1',
      [attempt_id]
    );

    if (attemptCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });
    }

    if (attemptCheck.rows[0].is_completed) {
      return NextResponse.json({ message: 'Attempt already completed' }, { status: 400 });
    }

    const attempt = attemptCheck.rows[0];
    const quizId = attempt.quiz_id;

    // Get quiz details
    const quizResult = await pool.query(
      'SELECT id, passing_score FROM quizzes WHERE id = $1',
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];
    const passingScore = quiz.passing_score || 70;

    // Get all responses for this attempt
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
      [attempt_id]
    );

    const responses = responsesResult.rows;

    // Calculate score
    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(r => r.is_correct).length;
    const score = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100
      : 0;

    // Calculate time taken
    const startTime = new Date(attempt.start_time);
    const endTime = new Date();
    const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // seconds

    // Update attempt
    const updateResult = await pool.query(
      `UPDATE quiz_attempts 
       SET end_time = CURRENT_TIMESTAMP, 
           score = $1, 
           is_completed = true, 
           time_taken = $2
       WHERE id = $3
       RETURNING *`,
      [score, timeTaken, attempt_id]
    );

    const completedAttempt = updateResult.rows[0];

    // Format responses with options
    const formattedResponses = responses.map(r => ({
      ...r,
      selected_option_ids: Array.isArray(r.selected_option_ids) 
        ? r.selected_option_ids 
        : JSON.parse(r.selected_option_ids || '[]'),
      options: r.options || [],
      created_at: r.created_at ? new Date(r.created_at).toISOString() : null
    }));

    return NextResponse.json({
      attempt: {
        ...completedAttempt,
        start_time: completedAttempt.start_time ? new Date(completedAttempt.start_time).toISOString() : null,
        end_time: completedAttempt.end_time ? new Date(completedAttempt.end_time).toISOString() : null
      },
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      passed: score >= passingScore,
      passing_score: passingScore,
      time_taken: timeTaken,
      responses: formattedResponses
    });
  } catch (error) {
    console.error('Error completing quiz:', error);
    return NextResponse.json(
      { message: 'Failed to complete quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

