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
  // Expected pattern: /api/admin/courses/{courseId}/sections/{sectionId}/chapters
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
    console.log("GET chapters for section - started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { sectionId } = extractIds(request.nextUrl.pathname);
    console.log("SectionId from URL:", sectionId);

    // Check if section exists
    console.log("Checking if section exists");
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1',
      [sectionId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    
    // Fetch chapters for this section
    console.log("Fetching chapters for section:", sectionId);
    const { rows } = await pool.query(
      `SELECT 
        id,
        module_id as section_id,
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
    
    const chapters = rows.map(chapter => ({
      ...chapter,
      content_type: chapter.video_url ? 'video' : 'text', // Add content_type based on video_url
      is_free_preview: false, // Default value since the column doesn't exist
      created_at: new Date(chapter.created_at).toISOString(),
      updated_at: new Date(chapter.updated_at).toISOString()
    }));

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST create chapter - started");
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const { courseId, sectionId } = extractIds(request.nextUrl.pathname);
    console.log("CourseId:", courseId, "SectionId:", sectionId);
    
    // Parse request body
    const { title, content, video_url, duration, order_index } = await request.json();
    console.log("Chapter data:", { title, content, video_url, duration, order_index });
    
    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { message: 'Chapter title is required' },
        { status: 400 }
      );
    }

    // Check if section exists and belongs to specified course
    console.log("Checking if section exists and belongs to course");
    const sectionCheck = await pool.query(
      'SELECT id FROM course_modules WHERE id = $1 AND course_id = $2',
      [sectionId, courseId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }

    // Determine order_index if not provided
    let finalOrderIndex = order_index;
    
    if (finalOrderIndex === undefined) {
      console.log("Determining order index");
      const positionResult = await pool.query(
        'SELECT COALESCE(MAX(order_index), 0) as max_position FROM course_lessons WHERE module_id = $1',
        [sectionId]
      );
      
      finalOrderIndex = parseInt(positionResult.rows[0].max_position) + 1;
      console.log("Calculated order index:", finalOrderIndex);
    }

    // Insert chapter into database
    console.log("Inserting new chapter");
    const result = await pool.query(
      `INSERT INTO course_lessons (
        module_id,
        title,
        content,
        video_url,
        duration,
        order_index,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        module_id as section_id,
        title,
        content,
        video_url,
        duration,
        order_index,
        created_at,
        updated_at`,
      [
        sectionId, 
        title, 
        content || null, 
        video_url || null,
        duration || null,
        finalOrderIndex
      ]
    );

    const newChapter = {
      ...result.rows[0],
      content_type: video_url ? 'video' : 'text', // Add content_type to response
      is_free_preview: false, // Default value since the column doesn't exist
      created_at: new Date(result.rows[0].created_at).toISOString(),
      updated_at: new Date(result.rows[0].updated_at).toISOString()
    };

    return NextResponse.json(
      { message: 'Chapter created successfully', chapter: newChapter },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 