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

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string; sectionId: string; chapterId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Properly await the params object in Next.js 14+
    const params = await context.params;
    const { courseId, sectionId, chapterId } = params;

    console.log(`Fetching chapter with ID: ${chapterId} in section ${sectionId}`);

    // Check if IDs are valid
    if (!sectionId || !chapterId) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // Note: Using course_lessons table instead of course_chapters
    // section_id is actually module_id in the database
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
      WHERE id = $1 AND module_id = $2`,
      [chapterId, sectionId]
    );

    if (rows.length === 0) {
      console.log(`No chapter found with ID ${chapterId} in section ${sectionId}`);
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    // Map the database fields to the expected API response fields
    const chapter = {
      ...rows[0],
      content_type: rows[0].video_url ? 'video' : 'text',
      is_free_preview: false, // Default value since the field doesn't exist in course_lessons
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString()
    };

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { courseId: string; sectionId: string; chapterId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Properly await the params object in Next.js 14+
    const params = await context.params;
    const { courseId, sectionId, chapterId } = params;
    
    // Check if IDs are valid
    if (!sectionId || !chapterId) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }
    
    const { 
      title, 
      content, 
      content_type,
      video_url,
      duration,
      is_free_preview,
      order_index 
    } = await request.json();

    // Validate chapter belongs to section (using course_lessons and module_id)
    const chapterCheck = await pool.query(
      'SELECT id FROM course_lessons WHERE id = $1 AND module_id = $2',
      [chapterId, sectionId]
    );

    if (chapterCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    // Build update query for course_lessons table
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }

    // Handle video_url based on content_type
    if (content_type !== undefined && video_url !== undefined) {
      if (content_type === 'video') {
        updates.push(`video_url = $${paramIndex}`);
        values.push(video_url);
        paramIndex++;
      } else {
        // For non-video content types, set video_url to null
        updates.push(`video_url = NULL`);
      }
    } else if (video_url !== undefined) {
      updates.push(`video_url = $${paramIndex}`);
      values.push(video_url);
      paramIndex++;
    }

    if (duration !== undefined) {
      updates.push(`duration = $${paramIndex}`);
      values.push(duration);
      paramIndex++;
    }

    if (order_index !== undefined) {
      updates.push(`order_index = $${paramIndex}`);
      values.push(order_index);
      paramIndex++;
    }

    // is_free_preview is not in the course_lessons table, so we'll ignore it

    // If no fields to update
    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update provided' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause and finalize query
    values.push(chapterId);
    const query = `
      UPDATE course_lessons 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        module_id as section_id,
        title,
        content,
        video_url,
        duration,
        order_index,
        created_at,
        updated_at
    `;

    // Execute the query
    const { rows } = await pool.query(query, values);

    // Map the database response to the expected API format
    return NextResponse.json({
      message: 'Chapter updated successfully',
      chapter: {
        ...rows[0],
        content_type: rows[0].video_url ? 'video' : 'text',
        is_free_preview: false, // Default value
        created_at: new Date(rows[0].created_at).toISOString(),
        updated_at: new Date(rows[0].updated_at).toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { courseId: string; sectionId: string; chapterId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Properly await the params object in Next.js 14+
    const params = await context.params;
    const { courseId, sectionId, chapterId } = params;

    // Check if IDs are valid
    if (!sectionId || !chapterId) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // Validate chapter belongs to section (using course_lessons and module_id)
    const chapterCheck = await pool.query(
      'SELECT id FROM course_lessons WHERE id = $1 AND module_id = $2',
      [chapterId, sectionId]
    );

    if (chapterCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    // Delete chapter from course_lessons
    await pool.query(
      'DELETE FROM course_lessons WHERE id = $1',
      [chapterId]
    );

    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 