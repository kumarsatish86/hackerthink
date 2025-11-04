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
    const { attempt_id, question_id, selected_option_ids, time_spent } = await request.json();

    // Validation
    if (!attempt_id || !question_id || !Array.isArray(selected_option_ids)) {
      return NextResponse.json(
        { message: 'attempt_id, question_id, and selected_option_ids are required' },
        { status: 400 }
      );
    }

    // Check if attempt exists and is not completed
    const attemptCheck = await pool.query(
      'SELECT id, quiz_id, is_completed FROM quiz_attempts WHERE id = $1',
      [attempt_id]
    );

    if (attemptCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });
    }

    if (attemptCheck.rows[0].is_completed) {
      return NextResponse.json({ message: 'Attempt already completed' }, { status: 400 });
    }

    // Get correct answers for this question
    const correctOptionsResult = await pool.query(
      'SELECT id FROM quiz_question_options WHERE question_id = $1 AND is_correct = true',
      [question_id]
    );
    const correctOptionIds = correctOptionsResult.rows.map(r => r.id);

    // Check if answer is correct
    const isCorrect = correctOptionIds.length > 0 && 
      selected_option_ids.length === correctOptionIds.length &&
      selected_option_ids.every((id: number) => correctOptionIds.includes(id)) &&
      correctOptionIds.every((id: number) => selected_option_ids.includes(id));

    // Check if response already exists
    const existingResponse = await pool.query(
      'SELECT id FROM quiz_responses WHERE attempt_id = $1 AND question_id = $2',
      [attempt_id, question_id]
    );

    let response;
    if (existingResponse.rows.length > 0) {
      // Update existing response
      const updateResult = await pool.query(
        `UPDATE quiz_responses 
         SET selected_option_ids = $1, is_correct = $2, time_spent = $3
         WHERE id = $4
         RETURNING *`,
        [
          JSON.stringify(selected_option_ids),
          isCorrect,
          time_spent || null,
          existingResponse.rows[0].id
        ]
      );
      response = updateResult.rows[0];
    } else {
      // Create new response
      const insertResult = await pool.query(
        `INSERT INTO quiz_responses (
          attempt_id, question_id, selected_option_ids, is_correct, time_spent
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          attempt_id,
          question_id,
          JSON.stringify(selected_option_ids),
          isCorrect,
          time_spent || null
        ]
      );
      response = insertResult.rows[0];
    }

    return NextResponse.json({
      response: {
        ...response,
        selected_option_ids: Array.isArray(response.selected_option_ids) 
          ? response.selected_option_ids 
          : JSON.parse(response.selected_option_ids || '[]'),
        created_at: response.created_at ? new Date(response.created_at).toISOString() : null
      },
      is_correct: isCorrect
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { message: 'Failed to submit answer', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

