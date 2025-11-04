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
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get question with options
    const questionResult = await pool.query(
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
      WHERE q.id = $1 AND q.quiz_id = $2
      GROUP BY q.id`,
      [questionId, id]
    );

    if (questionResult.rows.length === 0) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    const question = questionResult.rows[0];
    question.options = question.options || [];
    question.created_at = question.created_at ? new Date(question.created_at).toISOString() : null;
    question.updated_at = question.updated_at ? new Date(question.updated_at).toISOString() : null;

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { message: 'Failed to fetch question', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    
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
      options
    } = await request.json();

    // Check if question exists and belongs to quiz
    const questionCheck = await pool.query(
      'SELECT id FROM quiz_questions WHERE id = $1 AND quiz_id = $2',
      [questionId, id]
    );
    if (questionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Validate question type if provided
    if (question_type && !['multiple_choice', 'multiple_select', 'true_false'].includes(question_type)) {
      return NextResponse.json(
        { message: 'Invalid question type' },
        { status: 400 }
      );
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update question
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (question_text !== undefined) {
        updateFields.push(`question_text = $${paramIndex}`);
        updateValues.push(question_text);
        paramIndex++;
      }
      if (question_type !== undefined) {
        updateFields.push(`question_type = $${paramIndex}`);
        updateValues.push(question_type);
        paramIndex++;
      }
      if (order_in_quiz !== undefined) {
        updateFields.push(`order_in_quiz = $${paramIndex}`);
        updateValues.push(order_in_quiz);
        paramIndex++;
      }
      if (explanation_text !== undefined) {
        updateFields.push(`explanation_text = $${paramIndex}`);
        updateValues.push(explanation_text);
        paramIndex++;
      }
      if (related_article_url !== undefined) {
        updateFields.push(`related_article_url = $${paramIndex}`);
        updateValues.push(related_article_url);
        paramIndex++;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(questionId, id);

      if (updateFields.length > 1) {
        await client.query(
          `UPDATE quiz_questions SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND quiz_id = $${paramIndex + 1}`,
          updateValues
        );
      }

      // Update options if provided
      if (Array.isArray(options)) {
        // Delete existing options
        await client.query('DELETE FROM quiz_question_options WHERE question_id = $1', [questionId]);

        // Insert new options
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          await client.query(
            `INSERT INTO quiz_question_options (
              question_id, option_text, is_correct, order_in_question
            ) VALUES ($1, $2, $3, $4)`,
            [
              questionId,
              opt.option_text,
              opt.is_correct || false,
              opt.order_in_question !== undefined ? opt.order_in_question : i
            ]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      // Fetch updated question
      const questionResult = await pool.query(
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
        [questionId]
      );

      const updatedQuestion = questionResult.rows[0];
      updatedQuestion.options = updatedQuestion.options || [];
      updatedQuestion.created_at = updatedQuestion.created_at ? new Date(updatedQuestion.created_at).toISOString() : null;
      updatedQuestion.updated_at = updatedQuestion.updated_at ? new Date(updatedQuestion.updated_at).toISOString() : null;

      return NextResponse.json({
        message: 'Question updated successfully',
        question: updatedQuestion
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { message: 'Failed to update question', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if question exists and belongs to quiz
    const questionCheck = await pool.query(
      'SELECT id FROM quiz_questions WHERE id = $1 AND quiz_id = $2',
      [questionId, id]
    );
    if (questionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Delete question (cascade will handle options)
    await pool.query('DELETE FROM quiz_questions WHERE id = $1', [questionId]);

    // Reorder remaining questions
    await pool.query(
      `UPDATE quiz_questions 
       SET order_in_quiz = order_in_quiz - 1 
       WHERE quiz_id = $1 AND order_in_quiz > (
         SELECT order_in_quiz FROM quiz_questions WHERE id = $2
       )`,
      [id, questionId]
    );

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { message: 'Failed to delete question', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

