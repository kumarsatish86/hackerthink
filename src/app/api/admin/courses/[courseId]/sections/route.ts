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

// Helper function to extract the courseId safely
function getCourseId(pathname: string): string {
  // Expected pattern: /api/admin/courses/{courseId}/sections
  const parts = pathname.split('/');
  const courseIndex = parts.indexOf('courses') + 1;
  if (courseIndex > 0 && courseIndex < parts.length) {
    return parts[courseIndex];
  }
  return '';
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/courses/[courseId]/sections - Started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract courseId from URL
    const courseId = getCourseId(request.nextUrl.pathname);
    console.log("CourseId:", courseId);

    // Check if course exists
    const courseCheck = await pool.query(
      'SELECT c.id FROM courses c JOIN content ct ON c.id = ct.id WHERE c.id = $1',
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Fetch sections from database (course modules in this schema)
    const { rows } = await pool.query(
      `SELECT 
        id, 
        course_id,
        title,
        description,
        order_index as position,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM course_lessons WHERE module_id = course_modules.id) as lesson_count
      FROM course_modules 
      WHERE course_id = $1
      ORDER BY order_index ASC, created_at ASC`,
      [courseId]
    );

    // Format dates for display
    const sections = rows.map(section => ({
      ...section,
      created_at: new Date(section.created_at).toISOString(),
      updated_at: new Date(section.updated_at).toISOString()
    }));

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching course sections:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/courses/[courseId]/sections - Started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      console.log("Unauthorized - No session found");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract courseId from URL
    const courseId = getCourseId(request.nextUrl.pathname);
    console.log("CourseId:", courseId);
    
    // Parse the JSON body
    const body = await request.json();
    const { title, description } = body;
    console.log("Received body:", { title, description });

    // Validation
    if (!title) {
      console.log("Validation failed: Title is required");
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    console.log("Checking if course exists...");
    const courseCheck = await pool.query(
      'SELECT c.id FROM courses c JOIN content ct ON c.id = ct.id WHERE c.id = $1',
      [courseId]
    );
    console.log("Course check result:", courseCheck.rows);

    if (courseCheck.rows.length === 0) {
      console.log("Course not found with ID:", courseId);
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get the highest position for ordering
    console.log("Getting highest position...");
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(order_index), 0) as max_position FROM course_modules WHERE course_id = $1',
      [courseId]
    );
    const newPosition = parseInt(positionResult.rows[0].max_position) + 1;
    console.log("New position:", newPosition);

    // Insert section into database (course module in this schema)
    console.log("Inserting new module...");
    const result = await pool.query(
      `INSERT INTO course_modules (
        course_id,
        title,
        description,
        order_index,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, 
        course_id,
        title,
        description,
        order_index as position,
        created_at,
        updated_at`,
      [courseId, title, description || null, newPosition]
    );
    console.log("Insert result:", result.rows[0]);

    const newSection = {
      ...result.rows[0],
      lesson_count: 0,
      created_at: new Date(result.rows[0].created_at).toISOString(),
      updated_at: new Date(result.rows[0].updated_at).toISOString()
    };
    console.log("Formatted new section:", newSection);

    console.log("POST /api/admin/courses/[courseId]/sections - Completed successfully");
    return NextResponse.json(
      { message: 'Section created successfully', section: newSection },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating section:', error);
    // Log additional details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 