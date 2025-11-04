import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

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
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: Request) {
  try {
    // Check authentication - only verify the user is logged in
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, published, draft
    const difficulty = searchParams.get('difficulty') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // First check if the lab_exercises table exists
    try {
      // Simple query to check if the table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'lab_exercises'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.error('lab_exercises table does not exist');
        return NextResponse.json({ 
          message: 'Database table not found', 
          lab_exercises: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 }
        });
      }
      
      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`(le.title ILIKE $${paramCount} OR le.description ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      if (status === 'published') {
        whereConditions.push('le.published = true');
      } else if (status === 'draft') {
        whereConditions.push('le.published = false');
      }

      if (difficulty !== 'all') {
        whereConditions.push(`le.difficulty = '${difficulty}'`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM lab_exercises le ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Validate sortBy to prevent SQL injection
      const allowedSortColumns = ['created_at', 'updated_at', 'title', 'difficulty', 'duration', 'published'];
      const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Fetch exercises with pagination and author information
      const dataQuery = `
        SELECT 
          le.*,
          u.name as author_name
        FROM lab_exercises le
        LEFT JOIN users u ON le.author_id = u.id
        ${whereClause}
        ORDER BY le.${validSortBy} ${validSortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      const queryParamsWithPagination = [...queryParams, limit, offset];
      const { rows } = await pool.query(dataQuery, queryParamsWithPagination);

      // Format dates for display and provide defaults
      const labExercises = rows.map(exercise => ({
        ...exercise,
        author_name: exercise.author_name || 'Unknown Author',
        created_at: exercise.created_at ? new Date(exercise.created_at).toISOString() : new Date().toISOString(),
        updated_at: exercise.updated_at ? new Date(exercise.updated_at).toISOString() : new Date().toISOString()
      }));

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({ 
        lab_exercises: labExercises,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (dbError) {
      console.error('Database error fetching lab exercises:', dbError);
      
      // Gracefully handle by returning empty array instead of error
      return NextResponse.json({ 
        lab_exercises: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
        error: 'Database error',
        details: String(dbError)
      });
    }
  } catch (error) {
    console.error('Error in GET lab exercises:', error);
    return NextResponse.json({ 
      lab_exercises: [], 
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      error: 'Server error',
      details: String(error)
    });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication - only verify that the user is logged in
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Removed role check - any authenticated user can manage lab exercises

    // Parse request body
    const body = await request.json();
    const { 
      title, 
      slug = '', 
      description, 
      content, 
      instructions,
      solution,
      difficulty = 'Beginner',
      duration = 30,
      prerequisites,
      related_course_id,
      featured_image,
      meta_title,
      meta_description,
      schema_json,
      published = false,
      author_id,
      helpful_resources = [],
      terminal_simulation = {},
      related_exercises = [],
      sidebar_settings = {}
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    if (!instructions) {
      return NextResponse.json(
        { message: 'Instructions are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug || slugify(title, { lower: true, strict: true });

    // Ensure slug uniqueness by appending a number if it already exists
    let slugCounter = 1;
    let originalSlug = finalSlug;
    
    console.log(`Checking slug uniqueness for: ${finalSlug}`);
    
    while (true) {
      try {
        // Check if slug already exists
        const existingSlug = await pool.query(
          'SELECT id FROM lab_exercises WHERE slug = $1',
          [finalSlug]
        );
        
        if (existingSlug.rows.length === 0) {
          // Slug is unique, break the loop
          console.log(`Slug is unique: ${finalSlug}`);
          break;
        }
        
        // Slug exists, append a number
        console.log(`Slug exists, trying: ${originalSlug}-${slugCounter}`);
        finalSlug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
        
        // Prevent infinite loop
        if (slugCounter > 100) {
          console.error('Too many slug attempts, using timestamp');
          finalSlug = `${originalSlug}-${Date.now()}`;
          break;
        }
      } catch (error) {
        console.error('Error checking slug uniqueness:', error);
        break;
      }
    }

    // Set author_id from session if not explicitly provided
    // Handle author_id type conversion
    let finalAuthorId = author_id || session.user?.id?.toString();
    
    // If it's a UUID string, we need to find the corresponding integer ID
    if (typeof finalAuthorId === 'string' && finalAuthorId.includes('-')) {
      try {
        // Try to find the user by UUID and get their integer ID
        const userResult = await pool.query(
          'SELECT id FROM users WHERE id::text = $1',
          [finalAuthorId]
        );
        
        if (userResult.rows.length > 0) {
          finalAuthorId = userResult.rows[0].id;
        } else {
          // If user not found, set to null
          finalAuthorId = null;
        }
      } catch (err) {
        console.error('Error looking up user by UUID:', err);
        finalAuthorId = null;
      }
    }

    // Insert lab exercise into database
    let result;
    try {
      result = await pool.query(
        `INSERT INTO lab_exercises (
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
          author_id, 
          published, 
          helpful_resources,
          terminal_simulation,
          related_exercises,
          sidebar_settings
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING 
          id, 
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
          author_id, 
          published,
          helpful_resources,
          terminal_simulation,
          related_exercises,
          sidebar_settings`,
        [
          title, 
          finalSlug, 
          description || null, 
          content, 
          instructions,
          solution || null,
          difficulty,
          duration,
          prerequisites || null,
          related_course_id || null,
          featured_image || null,
          meta_title || null,
          meta_description || null,
          schema_json || null,
          finalAuthorId, 
          published,
          JSON.stringify(helpful_resources),
          JSON.stringify(terminal_simulation),
          JSON.stringify(related_exercises),
          JSON.stringify(sidebar_settings)
        ]
      );
    } catch (error: any) {
      console.error('Error creating lab exercise:', error);
      
      // Handle duplicate key error specifically
      if (error.code === '23505' && error.constraint === 'lab_exercises_slug_key') {
        // If we still get a duplicate key error, try with timestamp
        const timestampSlug = `${originalSlug}-${Date.now()}`;
        console.log(`Retrying with timestamp slug: ${timestampSlug}`);
        
        result = await pool.query(
          `INSERT INTO lab_exercises (
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
            author_id, 
            published, 
            helpful_resources,
            terminal_simulation,
            related_exercises,
            sidebar_settings,
            created_at, 
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING 
            id, 
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
            author_id, 
            published,
            helpful_resources,
            terminal_simulation,
            related_exercises,
            sidebar_settings,
            created_at, 
            updated_at`,
          [
            title, 
            timestampSlug, 
            description || null, 
            content, 
            instructions,
            solution || null,
            difficulty,
            duration,
            prerequisites || null,
            related_course_id || null,
            featured_image || null,
            meta_title || null,
            meta_description || null,
            schema_json || null,
            finalAuthorId, 
            published,
            JSON.stringify(helpful_resources),
            JSON.stringify(terminal_simulation),
            JSON.stringify(related_exercises),
            JSON.stringify(sidebar_settings)
          ]
        );
      } else {
        throw error;
      }
    }

    const newLabExercise = result.rows[0];

    return NextResponse.json(
      { message: 'Lab exercise created successfully', lab_exercise: newLabExercise },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lab exercise:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'Action and IDs are required' },
        { status: 400 }
      );
    }

    let result;
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

    switch (action) {
      case 'publish':
        result = await pool.query(
          `UPDATE lab_exercises SET published = true, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          ids
        );
        break;
      
      case 'unpublish':
        result = await pool.query(
          `UPDATE lab_exercises SET published = false, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          ids
        );
        break;
      
      case 'delete':
        result = await pool.query(
          `DELETE FROM lab_exercises WHERE id IN (${placeholders})`,
          ids
        );
        break;
      
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affectedRows: result.rowCount
    });

  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
