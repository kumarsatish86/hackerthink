import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { randomUUID } from 'crypto';

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
    
    // Get session (optional - for logged in users)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id.toString()) : null;

    // Get quiz
    const quizResult = await pool.query(
      'SELECT id, title, randomize_questions, randomize_answers FROM quizzes WHERE slug = $1 AND status = $2',
      [slug, 'published']
    );

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];

    // Generate session ID for anonymous users
    const sessionId = userId ? null : randomUUID();

    // Create quiz attempt
    const attemptResult = await pool.query(
      `INSERT INTO quiz_attempts (
        quiz_id, user_id, session_id, start_time, is_completed
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, false)
      RETURNING *`,
      [quiz.id, userId, sessionId]
    );

    const attempt = attemptResult.rows[0];

    // Get questions for this quiz
    let questionsQuery = `
      SELECT 
        qq.*,
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
      FROM quiz_questions qq
      LEFT JOIN quiz_question_options o ON qq.id = o.question_id
      WHERE qq.quiz_id = $1
      GROUP BY qq.id
      ORDER BY qq.order_in_quiz
    `;

    // Apply randomization if enabled
    if (quiz.randomize_questions) {
      questionsQuery = questionsQuery.replace(
        'ORDER BY qq.order_in_quiz',
        'ORDER BY RANDOM()'
      );
    }

    const questionsResult = await pool.query(questionsQuery, [quiz.id]);
    let questions = questionsResult.rows;

    // Randomize answer options if enabled
    if (quiz.randomize_answers) {
      questions = questions.map(q => ({
        ...q,
        options: [...(q.options || [])].sort(() => Math.random() - 0.5)
      }));
    }

    // Format questions (remove correct answer indicators for quiz taking)
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      order_in_quiz: q.order_in_quiz,
      explanation_text: null, // Don't show explanation yet
      related_article_url: q.related_article_url,
      options: (q.options || []).map((opt: any) => ({
        id: opt.id,
        option_text: opt.option_text,
        // Don't include is_correct in the response
        order_in_question: opt.order_in_question
      }))
    }));

    return NextResponse.json({
      attempt: {
        ...attempt,
        start_time: attempt.start_time ? new Date(attempt.start_time).toISOString() : null
      },
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { message: 'Failed to start quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

