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
  // Expected pattern: /api/admin/courses/{courseId}
  const parts = pathname.split('/');
  const courseIndex = parts.indexOf('courses') + 1;
  if (courseIndex > 0 && courseIndex < parts.length) {
    return parts[courseIndex];
  }
  return '';
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract courseId from URL
    const courseId = getCourseId(request.nextUrl.pathname);

    // Fetch course from database
    const { rows } = await pool.query(
      `SELECT 
        c.id, 
        ct.title,
        ct.slug,
        ct.description as short_description,
        ct.status as status,
        ct.author_id,
        ct.featured_image_url,
        ct.created_at,
        ct.updated_at,
        c.duration,
        c.difficulty_level as level,
        c.prerequisites,
        c.learning_objectives,
        u.name as author_name
      FROM courses c
      JOIN content ct ON c.id = ct.id
      LEFT JOIN users u ON ct.author_id = u.id
      WHERE c.id = $1`,
      [courseId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const course = {
      ...rows[0],
      published: rows[0].status === 'published',
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString(),
      learning_objectives: rows[0].learning_objectives || []
    };

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
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
    
    // Extract courseId from URL
    const courseId = getCourseId(request.nextUrl.pathname);
    
    // Parse the JSON body
    const updateData = await request.json();

    // Check if course exists
    const checkResult = await pool.query(
      'SELECT c.id FROM courses c JOIN content ct ON c.id = ct.id WHERE c.id = $1',
      [courseId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update content table
      const contentFields = ['title', 'slug', 'description', 'status', 'featured_image_url'];
      const contentUpdates = Object.keys(updateData)
        .filter(key => contentFields.includes(key) && updateData[key] !== undefined);
      
      if (contentUpdates.length > 0) {
        const contentSetClauses = contentUpdates.map((field, index) => {
          // Map client-side field names to database field names
          const dbField = field === 'short_description' ? 'description' : 
                          field === 'published' ? 'status' : field;
          return `${dbField} = $${index + 1}`;
        });
        
        const contentValues = contentUpdates.map(field => {
          // Convert boolean published to status string
          if (field === 'published') {
            return updateData[field] ? 'published' : 'draft';
          }
          return updateData[field];
        });
        
        contentValues.push(courseId); // Add courseId as the last parameter
        
        await client.query(
          `UPDATE content 
           SET ${contentSetClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${contentValues.length}`,
          contentValues
        );
      }

      // Update courses table
      const courseFields = ['difficulty_level', 'duration', 'prerequisites', 'learning_objectives'];
      const courseUpdates = Object.keys(updateData)
        .filter(key => {
          // Map client-side field names to database field names
          const dbField = key === 'level' ? 'difficulty_level' : key;
          return courseFields.includes(dbField) && updateData[key] !== undefined;
        });
      
      if (courseUpdates.length > 0) {
        const courseSetClauses = courseUpdates.map((field, index) => {
          // Map client-side field names to database field names
          const dbField = field === 'level' ? 'difficulty_level' : field;
          return `${dbField} = $${index + 1}`;
        });
        
        const courseValues = courseUpdates.map(field => {
          return field === 'level' ? updateData[field] : updateData[field];
        });
        
        courseValues.push(courseId); // Add courseId as the last parameter
        
        await client.query(
          `UPDATE courses 
           SET ${courseSetClauses.join(', ')}
           WHERE id = $${courseValues.length}`,
          courseValues
        );
      }

      // Fetch updated course
      const result = await client.query(
        `SELECT 
          c.id, 
          ct.title,
          ct.slug,
          ct.description as short_description,
          ct.status as status,
          ct.author_id,
          ct.featured_image_url,
          ct.created_at,
          ct.updated_at,
          c.duration,
          c.difficulty_level as level,
          c.prerequisites,
          c.learning_objectives,
          u.name as author_name
        FROM courses c
        JOIN content ct ON c.id = ct.id
        LEFT JOIN users u ON ct.author_id = u.id
        WHERE c.id = $1`,
        [courseId]
      );

      await client.query('COMMIT');

      const updatedCourse = {
        ...result.rows[0],
        published: result.rows[0].status === 'published',
        created_at: new Date(result.rows[0].created_at).toISOString(),
        updated_at: new Date(result.rows[0].updated_at).toISOString(),
        learning_objectives: result.rows[0].learning_objectives || []
      };

      return NextResponse.json({ 
        message: 'Course updated successfully', 
        course: updatedCourse 
      });
    } catch (error) {
      await client.query('ROLLBACK');

      if ((error as any).code === '23505') { // Unique violation
        return NextResponse.json(
          { message: 'A course with this slug already exists' },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating course:', error);
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

    // Extract courseId from URL
    const courseId = getCourseId(request.nextUrl.pathname);

    // Check if course exists
    const checkResult = await pool.query(
      'SELECT c.id FROM courses c JOIN content ct ON c.id = ct.id WHERE c.id = $1',
      [courseId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete from content table will cascade delete from courses table
    await pool.query('DELETE FROM content WHERE id = $1', [courseId]);

    return NextResponse.json({ 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 