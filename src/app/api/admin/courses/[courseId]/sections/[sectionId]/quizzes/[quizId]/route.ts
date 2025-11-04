import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Helper function to extract IDs from URL
function extractIds(pathname: string): { courseId: string; sectionId: string; quizId: string } {
  // Expected pattern: /api/admin/courses/{courseId}/sections/{sectionId}/quizzes/{quizId}
  const parts = pathname.split('/');
  const courseIndex = parts.indexOf('courses') + 1;
  const sectionIndex = parts.indexOf('sections') + 1;
  const quizIndex = parts.indexOf('quizzes') + 1;
  
  return {
    courseId: courseIndex > 0 && courseIndex < parts.length ? parts[courseIndex] : '',
    sectionId: sectionIndex > 0 && sectionIndex < parts.length ? parts[sectionIndex] : '',
    quizId: quizIndex > 0 && quizIndex < parts.length ? parts[quizIndex] : ''
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { sectionId, quizId } = extractIds(request.nextUrl.pathname);

    // Fetch quiz details
    const quizResult = await pool.query(
      `SELECT 
        id,
        section_id,
        title,
        description,
        time_limit,
        passing_score,
        attempts_allowed,
        order_index,
        created_at,
        updated_at
      FROM quizzes
      WHERE id = $1::integer AND section_id = $2`,
      [quizId, sectionId]
    );

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];

    // Check if quiz_questions table exists
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quiz_questions'
      )`
    );
    
    let questions = [];
    if (tableCheck.rows[0].exists) {
      // Fetch questions for this quiz
      const questionsResult = await pool.query(
        `SELECT 
          id,
          question,
          question_type,
          options,
          correct_answer,
          points,
          order_index
        FROM quiz_questions
        WHERE quiz_id = $1::integer
        ORDER BY order_index ASC`,
        [quizId]
      );
      
      questions = questionsResult.rows;
    }

    // Format dates and compile response
    const quizDetails = {
      ...quiz,
      questions,
      created_at: new Date(quiz.created_at).toISOString(),
      updated_at: new Date(quiz.updated_at).toISOString()
    };

    return NextResponse.json({ quiz: quizDetails });
  } catch (error: any) {
    console.error('Error fetching quiz details:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.toString() },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { sectionId, quizId } = extractIds(request.nextUrl.pathname);
    
    const { 
      title, 
      description, 
      time_limit,
      passing_score,
      attempts_allowed,
      order_index 
    } = await request.json();

    // Validate quiz belongs to section
    const quizCheck = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1::integer AND section_id = $2',
      [quizId, sectionId]
    );

    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (time_limit !== undefined) {
      updates.push(`time_limit = $${paramIndex}`);
      values.push(time_limit);
      paramIndex++;
    }

    if (passing_score !== undefined) {
      updates.push(`passing_score = $${paramIndex}`);
      values.push(passing_score);
      paramIndex++;
    }

    if (attempts_allowed !== undefined) {
      updates.push(`attempts_allowed = $${paramIndex}`);
      values.push(attempts_allowed);
      paramIndex++;
    }

    if (order_index !== undefined) {
      updates.push(`order_index = $${paramIndex}`);
      values.push(order_index);
      paramIndex++;
    }

    // If no fields to update
    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update provided' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause and finalize query
    values.push(quizId);
    const query = `
      UPDATE quizzes 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}::integer
      RETURNING 
        id,
        section_id,
        title,
        description,
        time_limit,
        passing_score,
        attempts_allowed,
        order_index,
        created_at,
        updated_at
    `;

    // Execute the query
    const { rows } = await pool.query(query, values);

    return NextResponse.json({
      message: 'Quiz updated successfully',
      quiz: {
        ...rows[0],
        created_at: new Date(rows[0].created_at).toISOString(),
        updated_at: new Date(rows[0].updated_at).toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.toString() },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { sectionId, quizId } = extractIds(request.nextUrl.pathname);

    // Validate quiz belongs to section
    const quizCheck = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1::integer AND section_id = $2',
      [quizId, sectionId]
    );

    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Delete quiz (cascade delete will handle questions)
    await pool.query(
      'DELETE FROM quizzes WHERE id = $1::integer',
      [quizId]
    );

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.toString() },
      { status: 500 }
    );
  }
} 