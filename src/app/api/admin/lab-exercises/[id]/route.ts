import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { unwrapParams } from '../../../../../utilities/nextjs-helpers';

// Create a custom slugify function instead of importing the package
function slugify(text: string, options: { lower?: boolean, strict?: boolean } = {}) {
  let result = text.toString();
  
  // Convert to lowercase if requested
  if (options.lower) {
    result = result.toLowerCase();
  }
  
  // Replace spaces with hyphens
  result = result.replace(/\s+/g, '-');
  
  if (options.strict) {
    // Remove special characters if strict mode
    result = result.replace(/[^\w\-]+/g, '');
    // Remove remaining non-alphanumeric characters except hyphens
    result = result.replace(/[^a-zA-Z0-9\-]+/g, '');
  }
  
  // Replace multiple hyphens with a single hyphen
  result = result.replace(/\-\-+/g, '-');
  
  // Remove leading and trailing hyphens
  result = result.replace(/^-+/, '').replace(/-+$/, '');
  
  return result;
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Safely unwrap params - with await since it's now async
    const unwrappedParams = await unwrapParams(params);
    const exerciseId = unwrappedParams.id;

    // Fetch lab exercise from database without the problematic JOIN
    const { rows } = await pool.query(
      `SELECT * FROM lab_exercises WHERE id = $1::integer`,
      [exerciseId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Lab exercise not found' }, { status: 404 });
    }

    const labExercise = {
      ...rows[0],
      author_name: 'Unknown Author', // Set a default since we can't join with users table
    };

    return NextResponse.json({ lab_exercise: labExercise });
  } catch (error) {
    console.error('Error fetching lab exercise:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - only verify that the user is logged in
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Safely unwrap params - with await since it's now async
    const unwrappedParams = await unwrapParams(params);
    const exerciseId = unwrappedParams.id;
    const body = await request.json();
    
    // Extract fields from body
    const { 
      title, 
      slug, 
      description, 
      content, 
      instructions,
      solution,
      difficulty,
      duration,
      prerequisites,
      related_course_id,
      featured_image,
      meta_title,
      meta_description,
      schema_json,
      published,
      author_id 
    } = body;
    
    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCounter++}`);
      queryParams.push(title);
      
      // Update slug if title is changed and slug is not explicitly provided
      if (slug === undefined) {
        updateFields.push(`slug = $${paramCounter++}`);
        queryParams.push(slugify(title, { lower: true, strict: true }));
      }
    }
    
    if (slug !== undefined) {
      updateFields.push(`slug = $${paramCounter++}`);
      queryParams.push(slug);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`);
      queryParams.push(description);
    }
    
    if (content !== undefined) {
      updateFields.push(`content = $${paramCounter++}`);
      queryParams.push(content);
    }
    
    if (instructions !== undefined) {
      updateFields.push(`instructions = $${paramCounter++}`);
      queryParams.push(instructions);
    }
    
    if (solution !== undefined) {
      updateFields.push(`solution = $${paramCounter++}`);
      queryParams.push(solution);
    }
    
    if (difficulty !== undefined) {
      updateFields.push(`difficulty = $${paramCounter++}`);
      queryParams.push(difficulty);
    }
    
    if (duration !== undefined) {
      updateFields.push(`duration = $${paramCounter++}`);
      queryParams.push(duration);
    }
    
    if (prerequisites !== undefined) {
      updateFields.push(`prerequisites = $${paramCounter++}`);
      queryParams.push(prerequisites);
    }
    
    if (related_course_id !== undefined) {
      updateFields.push(`related_course_id = $${paramCounter++}`);
      queryParams.push(related_course_id);
    }
    
    if (featured_image !== undefined) {
      updateFields.push(`featured_image = $${paramCounter++}`);
      queryParams.push(featured_image);
    }
    
    if (meta_title !== undefined) {
      updateFields.push(`meta_title = $${paramCounter++}`);
      queryParams.push(meta_title);
    }
    
    if (meta_description !== undefined) {
      updateFields.push(`meta_description = $${paramCounter++}`);
      queryParams.push(meta_description);
    }
    
    if (schema_json !== undefined) {
      updateFields.push(`schema_json = $${paramCounter++}`);
      queryParams.push(schema_json);
    }
    
    if (published !== undefined) {
      updateFields.push(`published = $${paramCounter++}`);
      queryParams.push(published);
    }
    
    if (author_id !== undefined) {
      updateFields.push(`author_id = $${paramCounter++}`);
      
      // Handle author_id type conversion
      let authorIdValue = author_id;
      
      // If it's a UUID string, we need to find the corresponding integer ID
      if (typeof author_id === 'string' && author_id.includes('-')) {
        try {
          // Try to find the user by UUID and get their integer ID
          const userResult = await pool.query(
            'SELECT id FROM users WHERE id::text = $1',
            [author_id]
          );
          
          if (userResult.rows.length > 0) {
            authorIdValue = userResult.rows[0].id;
          } else {
            // If user not found, set to null
            authorIdValue = null;
          }
        } catch (err) {
          console.error('Error looking up user by UUID:', err);
          authorIdValue = null;
        }
      }
      
      queryParams.push(authorIdValue);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no fields to update, return error
    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Add the lab exercise ID to the parameters array
    queryParams.push(exerciseId);
    
    // Execute the update query
    const { rowCount } = await pool.query(
      `UPDATE lab_exercises SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      queryParams
    );
    
    if (rowCount === 0) {
      return NextResponse.json(
        { message: 'Lab exercise not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Lab exercise updated successfully' });
  } catch (error) {
    console.error('Error updating lab exercise:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - only verify that the user is logged in
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Safely unwrap params - with await since it's now async
    const unwrappedParams = await unwrapParams(params);
    const exerciseId = unwrappedParams.id;

    // Execute DELETE query
    const { rowCount } = await pool.query(
      'DELETE FROM lab_exercises WHERE id = $1 RETURNING id',
      [exerciseId]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { message: 'Lab exercise not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Lab exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab exercise:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 