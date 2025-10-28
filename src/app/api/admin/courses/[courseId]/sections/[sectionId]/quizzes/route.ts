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
function extractIds(pathname: string): { courseId: string; sectionId: string } {
  // Expected pattern: /api/admin/courses/{courseId}/sections/{sectionId}/quizzes
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

    // Extract sectionId from URL
    const { sectionId } = extractIds(request.nextUrl.pathname);

    // Check if section exists
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1',
      [sectionId]
    );

    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    // Fetch quizzes for this section
    const { rows } = await pool.query(
      `SELECT 
        id,
        title,
        description,
        time_limit,
        passing_score,
        attempts_allowed,
        order_index,
        created_at,
        updated_at
      FROM quizzes
      WHERE section_id = $1
      ORDER BY order_index ASC`,
      [sectionId]
    );

    // Format dates for display
    const quizzes = rows.map(quiz => ({
      ...quiz,
      created_at: new Date(quiz.created_at).toISOString(),
      updated_at: new Date(quiz.updated_at).toISOString()
    }));

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST - Creating new quiz - Started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract sectionId from URL
    const { sectionId } = extractIds(request.nextUrl.pathname);
    console.log("SectionId from URL:", sectionId);
    
    const { 
      title, 
      description, 
      time_limit,
      passing_score,
      attempts_allowed,
      order_index 
    } = await request.json();
    console.log("Quiz data:", { title, description, time_limit, passing_score, attempts_allowed, order_index });

    // Validation
    if (!title) {
      return NextResponse.json(
        { message: 'Quiz title is required' },
        { status: 400 }
      );
    }

    // Check if section exists
    console.log("Checking if section exists with ID:", sectionId);
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1',
      [sectionId]
    );
    console.log("Section check result:", sectionCheck.rows);

    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    // Check if quizzes table exists
    console.log("Checking if quizzes table exists");
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quizzes'
      )`
    );
    
    // If table exists, check its structure
    if (tableCheck.rows[0].exists) {
      console.log("Quizzes table exists, checking its structure");
      try {
        // Check table structure
        const tableStructure = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'quizzes'
        `);
        
        console.log("Quizzes table structure:", tableStructure.rows);
        
        // If the structure is wrong, drop and recreate the table
        const expectedColumns = ['id', 'section_id', 'title', 'description', 'time_limit', 
                               'passing_score', 'attempts_allowed', 'order_index', 'created_at', 'updated_at'];
        const actualColumns = tableStructure.rows.map(col => col.column_name);
        
        // Check if any expected column is missing
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log("Missing columns in quizzes table:", missingColumns);
          console.log("Dropping and recreating quizzes table");
          
          // Drop the table and recreate it
          await pool.query(`DROP TABLE IF EXISTS quizzes CASCADE`);
          console.log("Table dropped");
          tableCheck.rows[0].exists = false; // Force table recreation
        }
      } catch (error) {
        console.error("Error checking quizzes table structure:", error);
        // If there's an error checking the structure, drop and recreate the table
        try {
          await pool.query(`DROP TABLE IF EXISTS quizzes CASCADE`);
          console.log("Table dropped due to error");
          tableCheck.rows[0].exists = false; // Force table recreation
        } catch (dropError) {
          console.error("Error dropping quizzes table:", dropError);
          throw dropError;
        }
      }
    }
    
    // Create quizzes table if it doesn't exist
    if (!tableCheck.rows[0].exists) {
      console.log("Creating quizzes table");
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS quizzes (
            id SERIAL PRIMARY KEY,
            section_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            time_limit INTEGER,
            passing_score INTEGER DEFAULT 70,
            attempts_allowed INTEGER DEFAULT 1,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log("Quizzes table created successfully");
      } catch (error) {
        console.error("Error creating quizzes table:", error);
        throw error;
      }
    }
    
    // Determine order_index if not provided
    let finalOrderIndex = order_index;
    
    if (finalOrderIndex === undefined) {
      try {
        const orderResult = await pool.query(
          'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM quizzes WHERE section_id = $1',
          [sectionId]
        );
        
        finalOrderIndex = orderResult.rows[0].next_order;
        console.log("Calculated order index:", finalOrderIndex);
      } catch (err) {
        console.log("Error getting max order index, defaulting to 0:", err);
        finalOrderIndex = 0;
      }
    }

    // Insert quiz into database
    console.log("Inserting quiz with sectionId:", sectionId);
    console.log("Parameters:", [
      sectionId, 
      title, 
      description || null, 
      time_limit || null,
      passing_score || 70,
      attempts_allowed || 1,
      finalOrderIndex || 0
    ]);
    
    const result = await pool.query(
      `INSERT INTO quizzes (
        section_id,
        title,
        description,
        time_limit,
        passing_score,
        attempts_allowed,
        order_index,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
        updated_at`,
      [
        sectionId, 
        title, 
        description || null, 
        time_limit || null,
        passing_score || 70,
        attempts_allowed || 1,
        finalOrderIndex || 0
      ]
    );
    console.log("Quiz created successfully, result:", result.rows[0]);

    const newQuiz = {
      ...result.rows[0],
      created_at: new Date(result.rows[0].created_at).toISOString(),
      updated_at: new Date(result.rows[0].updated_at).toISOString()
    };

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: newQuiz },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating quiz:', error);
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