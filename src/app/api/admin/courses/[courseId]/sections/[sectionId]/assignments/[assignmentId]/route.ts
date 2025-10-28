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

// Helper function to extract IDs from the pathname
function extractIds(pathname: string) {
  const courseIdMatch = pathname.match(/courses\/([^\/]+)/);
  const sectionIdMatch = pathname.match(/sections\/([^\/]+)/);
  const assignmentIdMatch = pathname.match(/assignments\/([^\/]+)/);
  
  return {
    courseId: courseIdMatch ? courseIdMatch[1] : null,
    sectionId: sectionIdMatch ? sectionIdMatch[1] : null,
    assignmentId: assignmentIdMatch ? assignmentIdMatch[1] : null,
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
    const { assignmentId } = extractIds(request.nextUrl.pathname);

    // Check if assignments table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);

    // If table doesn't exist, return 404
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Fetch assignment
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
      WHERE id = $1`,
      [assignmentId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Format dates for response
    const assignment = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString(),
      due_date: rows[0].due_date ? new Date(rows[0].due_date).toISOString() : null
    };

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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
    const { assignmentId } = extractIds(request.nextUrl.pathname);

    // Check if assignments table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);

    // If table doesn't exist, return 404
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Get request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.instructions) {
      return NextResponse.json(
        { message: 'Title and instructions are required' },
        { status: 400 }
      );
    }

    // Update assignment
    const { rows } = await pool.query(
      `UPDATE assignments SET
        title = $1,
        description = $2,
        instructions = $3,
        points = $4,
        due_date = $5,
        submission_type = $6,
        order_index = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [
        data.title,
        data.description || '',
        data.instructions,
        data.points || 10,
        data.due_date || null,
        data.submission_type || 'text',
        data.order_index || 0,
        assignmentId
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Format dates for response
    const assignment = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString(),
      due_date: rows[0].due_date ? new Date(rows[0].due_date).toISOString() : null
    };

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Error updating assignment:', error);
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
    const { assignmentId } = extractIds(request.nextUrl.pathname);

    // Check if assignments table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);

    // If table doesn't exist, return 404
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    // Delete assignment
    const { rowCount } = await pool.query(
      'DELETE FROM assignments WHERE id = $1',
      [assignmentId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 