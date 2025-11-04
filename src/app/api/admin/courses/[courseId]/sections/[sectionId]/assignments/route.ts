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

// Helper function to extract IDs from the pathname
function extractIds(pathname: string) {
  const courseIdMatch = pathname.match(/courses\/([^\/]+)/);
  const sectionIdMatch = pathname.match(/sections\/([^\/]+)/);
  
  return {
    courseId: courseIdMatch ? courseIdMatch[1] : null,
    sectionId: sectionIdMatch ? sectionIdMatch[1] : null,
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

    // Check if assignments table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);

    // If table doesn't exist, return empty array
    if (!tableCheck.rows[0].exists) {
      console.log('Assignments table does not exist');
      return NextResponse.json({ assignments: [] });
    }

    // Fetch assignments for this section
    const { rows } = await pool.query(
      `SELECT 
        id,
        section_id,
        title,
        description,
        instructions,
        points,
        due_date,
        submission_type,
        order_index,
        created_at,
        updated_at
      FROM assignments
      WHERE section_id = $1
      ORDER BY order_index ASC`,
      [sectionId]
    );

    // Format dates for display
    const assignments = rows.map(assignment => ({
      ...assignment,
      created_at: new Date(assignment.created_at).toISOString(),
      updated_at: new Date(assignment.updated_at).toISOString(),
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString() : null
    }));

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { courseId, sectionId } = extractIds(request.nextUrl.pathname);

    // Validate course and section exist
    const sectionCheck = await pool.query(
      'SELECT cm.id, cm.course_id FROM course_modules cm WHERE cm.id = $1 AND cm.course_id = $2',
      [sectionId, courseId]
    );

    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found or does not belong to this course' }, { status: 404 });
    }

    // Get the request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.instructions) {
      return NextResponse.json(
        { message: 'Title and instructions are required' },
        { status: 400 }
      );
    }

    // Check if assignments table exists and create it if not
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating assignments table');
      await pool.query(`
        CREATE TABLE assignments (
          id SERIAL PRIMARY KEY,
          section_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          instructions TEXT NOT NULL,
          points INTEGER DEFAULT 10,
          due_date TIMESTAMP,
          submission_type VARCHAR(50) DEFAULT 'text',
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Create assignment in database
    const { rows } = await pool.query(
      `INSERT INTO assignments (
        section_id, 
        title, 
        description,
        instructions,
        points,
        due_date,
        submission_type,
        order_index
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        sectionId,
        data.title,
        data.description || '',
        data.instructions,
        data.points || 10,
        data.due_date || null,
        data.submission_type || 'text',
        data.order_index || 0
      ]
    );

    // Format dates for the response
    const assignment = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString(),
      due_date: rows[0].due_date ? new Date(rows[0].due_date).toISOString() : null
    };

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 