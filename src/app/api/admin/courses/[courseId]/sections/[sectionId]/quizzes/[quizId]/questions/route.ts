import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Helper function to extract IDs from URL
function extractIds(pathname: string): { courseId: string; sectionId: string; quizId: string } {
  // Expected pattern: /api/admin/courses/{courseId}/sections/{sectionId}/quizzes/{quizId}/questions
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
    const { quizId } = extractIds(request.nextUrl.pathname);

    // Check if quiz exists
    const quizCheck = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1::integer',
      [quizId]
    );

    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Check if quiz_questions table exists
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quiz_questions'
      )`
    );
    
    if (!tableCheck.rows[0].exists) {
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ questions: [] });
    }

    // Fetch questions for this quiz
    const { rows } = await pool.query(
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

    return NextResponse.json({ questions: rows });
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST - Creating new quiz question - Started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { quizId } = extractIds(request.nextUrl.pathname);
    console.log("QuizId from URL:", quizId);
    
    const { 
      question, 
      question_type, 
      options,
      correct_answer,
      points,
      order_index 
    } = await request.json();
    console.log("Question data:", { question, question_type, options, correct_answer, points, order_index });

    // Validation
    if (!question) {
      return NextResponse.json(
        { message: 'Question text is required' },
        { status: 400 }
      );
    }

    if (!question_type || !['multiple_choice', 'true_false', 'fill_in_blank'].includes(question_type)) {
      return NextResponse.json(
        { message: 'Valid question type is required (multiple_choice, true_false, fill_in_blank)' },
        { status: 400 }
      );
    }

    // Additional validation for multiple choice
    if (question_type === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
      return NextResponse.json(
        { message: 'Multiple choice questions require at least 2 options' },
        { status: 400 }
      );
    }

    if (!correct_answer) {
      return NextResponse.json(
        { message: 'Correct answer is required' },
        { status: 400 }
      );
    }

    // Check if quiz exists
    console.log("Checking if quiz exists with ID:", quizId);
    const quizCheck = await pool.query(
      'SELECT id FROM quizzes WHERE id = $1::integer',
      [quizId]
    );
    console.log("Quiz check result:", quizCheck.rows);

    if (quizCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Check if quiz_questions table exists and has correct structure
    console.log("Checking quiz_questions table");
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quiz_questions'
      )`
    );
    
    // If table exists, check its structure
    if (tableCheck.rows[0].exists) {
      console.log("Quiz_questions table exists, checking structure");
      try {
        // Check table structure
        const tableStructure = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'quiz_questions'
        `);
        
        console.log("Quiz_questions table structure:", tableStructure.rows);
        
        // If the structure is wrong, drop and recreate the table
        const expectedColumns = ['id', 'quiz_id', 'question', 'question_type', 'options', 
                                'correct_answer', 'points', 'order_index'];
        const actualColumns = tableStructure.rows.map(col => col.column_name);
        
        // Check if any expected column is missing
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log("Missing columns in quiz_questions table:", missingColumns);
          console.log("Dropping and recreating quiz_questions table");
          
          // Drop the table and recreate it
          await pool.query(`DROP TABLE IF EXISTS quiz_questions CASCADE`);
          tableCheck.rows[0].exists = false; // Force table recreation
        }
      } catch (error) {
        console.error("Error checking quiz_questions table structure:", error);
        // If there's an error checking the structure, drop and recreate the table
        try {
          await pool.query(`DROP TABLE IF EXISTS quiz_questions CASCADE`);
          tableCheck.rows[0].exists = false; // Force table recreation
        } catch (dropError) {
          console.error("Error dropping quiz_questions table:", dropError);
        }
      }
    }
    
    // Create quiz_questions table if it doesn't exist
    if (!tableCheck.rows[0].exists) {
      console.log("Creating quiz_questions table");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL,
          options JSONB,
          correct_answer JSONB NOT NULL,
          points INTEGER DEFAULT 1,
          order_index INTEGER DEFAULT 0
        )
      `);
      console.log("Quiz_questions table created successfully");
    }

    // Determine order_index if not provided
    let finalOrderIndex = order_index;
    
    if (finalOrderIndex === undefined) {
      try {
        const orderResult = await pool.query(
          'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM quiz_questions WHERE quiz_id = $1::integer',
          [quizId]
        );
        
        finalOrderIndex = orderResult.rows[0].next_order;
        console.log("Calculated order index:", finalOrderIndex);
      } catch (err) {
        console.log("Error getting max order index, defaulting to 0:", err);
        finalOrderIndex = 0;
      }
    }

    // Insert question into database
    console.log("Inserting question for quiz_id:", quizId);
    console.log("Question parameters:", [
      quizId, 
      question, 
      question_type, 
      options ? JSON.stringify(options) : null,
      JSON.stringify(correct_answer),
      points || 1,
      finalOrderIndex || 0
    ]);
    
    const result = await pool.query(
      `INSERT INTO quiz_questions (
        quiz_id,
        question,
        question_type,
        options,
        correct_answer,
        points,
        order_index
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        question,
        question_type,
        options,
        correct_answer,
        points,
        order_index`,
      [
        quizId, 
        question, 
        question_type, 
        options ? JSON.stringify(options) : null,
        JSON.stringify(correct_answer),
        points || 1,
        finalOrderIndex || 0
      ]
    );
    console.log("Question created successfully, result:", result.rows[0]);

    return NextResponse.json(
      { message: 'Question created successfully', question: result.rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating quiz question:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack trace:', error.stack);
    if (error.detail) console.error('SQL error details:', error.detail);
    if (error.code) console.error('SQL error code:', error.code);
    
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error.toString(),
        detail: error.detail || null,
        code: error.code || null
      },
      { status: 500 }
    );
  }
} 