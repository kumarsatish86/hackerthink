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

// Helper to extract quiz ID from URL
function extractQuizId(pathname: string): string {
  const parts = pathname.split('/');
  const quizIndex = parts.indexOf('quizzes') + 1;
  return quizIndex > 0 && quizIndex < parts.length ? parts[quizIndex] : '';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if quiz exists
    const quizCheck = await pool.query('SELECT id FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Get all questions with their options
    const questionsResult = await pool.query(
      `SELECT 
        q.*,
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
      FROM quiz_questions q
      LEFT JOIN quiz_question_options o ON q.id = o.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id
      ORDER BY q.order_in_quiz`,
      [id]
    );

    const questions = questionsResult.rows.map(q => ({
      ...q,
      options: q.options || [],
      created_at: q.created_at ? new Date(q.created_at).toISOString() : null,
      updated_at: q.updated_at ? new Date(q.updated_at).toISOString() : null
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch questions', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const {
      question_text,
      question_type,
      order_in_quiz,
      explanation_text,
      related_article_url,
      options = []
    } = await request.json();

    // Validation
    if (!question_text || !question_type) {
      return NextResponse.json(
        { message: 'Question text and type are required' },
        { status: 400 }
      );
    }

    if (!['multiple_choice', 'multiple_select', 'true_false'].includes(question_type)) {
      return NextResponse.json(
        { message: 'Invalid question type' },
        { status: 400 }
      );
    }

    // Validate options
    if (question_type !== 'true_false' && (!Array.isArray(options) || options.length < 2)) {
      return NextResponse.json(
        { message: 'At least 2 options are required for this question type' },
        { status: 400 }
      );
    }

    // Check if at least one option is correct
    if (question_type !== 'true_false' && !options.some((opt: any) => opt.is_correct)) {
      return NextResponse.json(
        { message: 'At least one option must be marked as correct' },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const quizCheck = await pool.query('SELECT id FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Determine order_in_quiz if not provided
    let finalOrder = order_in_quiz;
    if (finalOrder === undefined || finalOrder === null) {
      const orderResult = await pool.query(
        'SELECT COALESCE(MAX(order_in_quiz), -1) + 1 as next_order FROM quiz_questions WHERE quiz_id = $1',
        [id]
      );
      finalOrder = orderResult.rows[0].next_order;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert question
      const questionResult = await client.query(
        `INSERT INTO quiz_questions (
          quiz_id, question_text, question_type, order_in_quiz,
          explanation_text, related_article_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          id,
          question_text,
          question_type,
          finalOrder,
          explanation_text || null,
          related_article_url || null
        ]
      );

      const newQuestion = questionResult.rows[0];

      // Insert options
      if (question_type === 'true_false') {
        // For true/false, create two default options if not provided
        const trueFalseOptions = options.length === 2 
          ? options 
          : [
              { option_text: 'True', is_correct: false, order_in_question: 0 },
              { option_text: 'False', is_correct: false, order_in_question: 1 }
            ];
        
        for (let i = 0; i < trueFalseOptions.length; i++) {
          const opt = trueFalseOptions[i];
          await client.query(
            `INSERT INTO quiz_question_options (
              question_id, option_text, is_correct, order_in_question
            ) VALUES ($1, $2, $3, $4)`,
            [
              newQuestion.id,
              opt.option_text,
              opt.is_correct || false,
              opt.order_in_question !== undefined ? opt.order_in_question : i
            ]
          );
        }
      } else {
        // For multiple choice/select
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          await client.query(
            `INSERT INTO quiz_question_options (
              question_id, option_text, is_correct, order_in_question
            ) VALUES ($1, $2, $3, $4)`,
            [
              newQuestion.id,
              opt.option_text,
              opt.is_correct || false,
              opt.order_in_question !== undefined ? opt.order_in_question : i
            ]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      // Fetch the complete question with options
      const completeQuestionResult = await pool.query(
        `SELECT 
          q.*,
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
        FROM quiz_questions q
        LEFT JOIN quiz_question_options o ON q.id = o.question_id
        WHERE q.id = $1
        GROUP BY q.id`,
        [newQuestion.id]
      );

      const completeQuestion = completeQuestionResult.rows[0];
      completeQuestion.options = completeQuestion.options || [];
      completeQuestion.created_at = completeQuestion.created_at ? new Date(completeQuestion.created_at).toISOString() : null;
      completeQuestion.updated_at = completeQuestion.updated_at ? new Date(completeQuestion.updated_at).toISOString() : null;

      return NextResponse.json(
        { message: 'Question created successfully', question: completeQuestion },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { message: 'Failed to create question', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

