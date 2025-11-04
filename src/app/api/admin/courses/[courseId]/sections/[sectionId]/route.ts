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
function extractIds(pathname: string): { courseId: string; sectionId: string } {
  // Expected pattern: /api/admin/courses/{courseId}/sections/{sectionId}
  const parts = pathname.split('/');
  const courseIndex = parts.indexOf('courses') + 1;
  const sectionIndex = parts.indexOf('sections') + 1;
  
  return {
    courseId: courseIndex > 0 && courseIndex < parts.length ? parts[courseIndex] : '',
    sectionId: sectionIndex > 0 && sectionIndex < parts.length ? parts[sectionIndex] : ''
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
    const { courseId, sectionId } = extractIds(request.nextUrl.pathname);
    console.log("GET section details - courseId:", courseId, "sectionId:", sectionId);

    if (!courseId || !sectionId) {
      return NextResponse.json({ message: 'Invalid course or section ID' }, { status: 400 });
    }

    // Fetch section details
    console.log("Fetching section details");
    const sectionResult = await pool.query(
      `SELECT 
        id,
        course_id,
        title,
        description,
        order_index,
        created_at,
        updated_at
      FROM course_modules
      WHERE id = $1 AND course_id = $2`,
      [sectionId, courseId]
    );

    if (sectionResult.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    const section = sectionResult.rows[0];
    console.log("Section found:", section.title);

    // Fetch chapters for this section
    console.log("Fetching chapters for section");
    const chaptersResult = await pool.query(
      `SELECT 
        id,
        title,
        content,
        video_url,
        duration,
        order_index,
        created_at,
        updated_at
      FROM course_lessons
      WHERE module_id = $1
      ORDER BY order_index ASC`,
      [sectionId]
    );
    
    const chapters = chaptersResult.rows.map(chapter => ({
      ...chapter,
      content_type: chapter.video_url ? 'video' : 'text',
      is_free_preview: false // Default value since the column doesn't exist
    }));
    console.log(`Found ${chapters.length} chapters`);
    
    // Fetch quizzes for this section (check if quizzes table exists)
    let quizzes = [];
    try {
      console.log("Checking if quizzes table exists");
      const quizzesResult = await pool.query(
        `SELECT *
        FROM information_schema.tables 
        WHERE table_name = 'quizzes'`
      );
      
      // Only query the quizzes table if it exists
      if (quizzesResult.rows.length > 0) {
        console.log("Quizzes table exists, checking columns");
        
        // Check if section_id column exists in quizzes table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'quizzes'
        `);
        
        const columns = columnCheck.rows.map(row => row.column_name);
        console.log("Columns in quizzes table:", columns);
        
        // Determine which column to use - prefer section_id if exists
        let columnToUse = "section_id";
        if (!columns.includes("section_id") && columns.includes("module_id")) {
          columnToUse = "module_id";
          console.log("Using module_id column for compatibility");
        }
        
        const quizzesDataResult = await pool.query(
          `SELECT id
          FROM quizzes
          WHERE ${columnToUse} = $1
          ORDER BY id ASC`,
          [sectionId]
        );
        console.log("Found quizzes:", quizzesDataResult.rows.length);
        quizzes = quizzesDataResult.rows;
      } else {
        console.log("Quizzes table does not exist yet");
      }
    } catch (error) {
      console.log("Quizzes table may not exist yet:", error);
      // Continue with empty quizzes array
    }
    
    // Similarly handle assignments table check
    let assignments = [];
    try {
      console.log("Checking if assignments table exists");
      const assignmentsResult = await pool.query(
        `SELECT *
        FROM information_schema.tables 
        WHERE table_name = 'assignments'`
      );
      
      // Only query the assignments table if it exists
      if (assignmentsResult.rows.length > 0) {
        console.log("Assignments table exists, checking columns");
        
        // Check if section_id column exists in assignments table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'assignments'
        `);
        
        const columns = columnCheck.rows.map(row => row.column_name);
        console.log("Columns in assignments table:", columns);
        
        // Determine which column to use - prefer section_id if exists
        let columnToUse = "section_id";
        if (!columns.includes("section_id") && columns.includes("module_id")) {
          columnToUse = "module_id";
          console.log("Using module_id column for compatibility");
        }
        
        const assignmentsDataResult = await pool.query(
          `SELECT id
          FROM assignments
          WHERE ${columnToUse} = $1
          ORDER BY id ASC`,
          [sectionId]
        );
        console.log("Found assignments:", assignmentsDataResult.rows.length);
        assignments = assignmentsDataResult.rows;
      } else {
        console.log("Assignments table does not exist yet");
      }
    } catch (error) {
      console.log("Assignments table may not exist yet:", error);
      // Continue with empty assignments array
    }

    // Fetch questions for each quiz
    for (const quiz of quizzes) {
      try {
        console.log("Checking if quiz_questions table exists for quiz ID:", quiz.id);
        const tableCheck = await pool.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'quiz_questions'
          )`
        );
        
        if (tableCheck.rows[0].exists) {
          console.log("Quiz_questions table exists, checking columns");
          // Check if all required columns exist
          const columnsCheck = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'quiz_questions'
          `);
          
          const columns = columnsCheck.rows.map(row => row.column_name);
          console.log("Columns in quiz_questions table:", columns);
          
          // Check if all required columns exist
          const requiredColumns = ['quiz_id', 'question', 'question_type', 'options', 'correct_answer', 'points', 'order_index'];
          const missingColumns = requiredColumns.filter(col => !columns.includes(col));
          
          if (missingColumns.length === 0) {
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
              WHERE quiz_id = $1
              ORDER BY order_index ASC`,
              [quiz.id]
            );
            
            quiz.questions = questionsResult.rows;
            console.log(`Found ${questionsResult.rows.length} questions for quiz ${quiz.id}`);
          } else {
            console.log("Missing required columns in quiz_questions table:", missingColumns);
            quiz.questions = [];
          }
        } else {
          console.log("Quiz_questions table does not exist");
          quiz.questions = [];
        }
      } catch (error) {
        console.error("Error fetching questions for quiz:", quiz.id, error);
        quiz.questions = [];
      }
    }
    
    // Format dates and compile response
    const sectionDetails = {
      ...section,
      chapters,
      quizzes,
      assignments,
      created_at: new Date(section.created_at).toISOString(),
      updated_at: new Date(section.updated_at).toISOString()
    };

    return NextResponse.json({ section: sectionDetails });
  } catch (error: any) {
    console.error('Error fetching section details:', error);
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

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { courseId, sectionId } = extractIds(request.nextUrl.pathname);
    const { title, description, order_index } = await request.json();

    // Validate section belongs to course
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1 AND course_id = $2',
      [sectionId, courseId]
    );

    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
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
    values.push(sectionId);
    const query = `
      UPDATE course_modules 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, course_id, title, description, order_index, created_at, updated_at
    `;

    // Execute the query
    const { rows } = await pool.query(query, values);

    return NextResponse.json({
      message: 'Section updated successfully',
      section: {
        ...rows[0],
        created_at: new Date(rows[0].created_at).toISOString(),
        updated_at: new Date(rows[0].updated_at).toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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
    const { courseId, sectionId } = extractIds(request.nextUrl.pathname);

    // Validate section belongs to course
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1 AND course_id = $2',
      [sectionId, courseId]
    );

    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    // Delete section and all related content (cascading should handle dependencies)
    await pool.query('DELETE FROM course_modules WHERE id = $1', [sectionId]);

    return NextResponse.json({ 
      message: 'Section deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 