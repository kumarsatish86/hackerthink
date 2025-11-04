import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import slugify from 'slugify';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (difficulty !== 'all') {
      whereConditions.push(`difficulty = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Check if quizzes table exists, if not return empty result
    let tableExists = true;
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'quizzes'
        )
      `);
      tableExists = tableCheck.rows[0].exists;
    } catch (error) {
      console.error('Error checking table existence:', error);
      tableExists = false;
    }

    if (!tableExists) {
      return NextResponse.json({
        quizzes: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        },
        message: 'Quizzes tables not created. Please run the migration first at /api/admin/migrations/create-quizzes-tables'
      });
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM quizzes ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get quizzes with pagination
    const validSortColumns = ['created_at', 'updated_at', 'title', 'difficulty', 'status'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get quizzes with pagination
    let quizzes: any[] = [];
    try {
      const query = `
        SELECT 
          q.*,
          u.name as created_by_name,
          COUNT(DISTINCT qq.id) as question_count,
          ARRAY_AGG(DISTINCT qc.name) FILTER (WHERE qc.name IS NOT NULL) as category_names
        FROM quizzes q
        LEFT JOIN users u ON q.created_by = u.id
        LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
        LEFT JOIN quiz_category_assignments qca ON q.id = qca.quiz_id
        LEFT JOIN quiz_categories qc ON qca.category_id = qc.id
        ${whereClause}
        GROUP BY q.id, u.name
        ORDER BY q.${safeSortBy} ${safeSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(limit, offset);
      const result = await pool.query(query, queryParams);
      quizzes = result.rows;
    } catch (error: any) {
      // If table doesn't exist or other database error, return empty array
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('Quizzes table does not exist yet');
        return NextResponse.json({
          quizzes: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0
          },
          message: 'Quizzes tables not created. Please run the migration first.'
        });
      }
      throw error;
    }

    // Format the quizzes data
    const formattedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      created_at: quiz.created_at ? new Date(quiz.created_at).toISOString() : null,
      updated_at: quiz.updated_at ? new Date(quiz.updated_at).toISOString() : null,
      question_count: parseInt(quiz.question_count) || 0,
      category_names: quiz.category_names || []
    }));

    return NextResponse.json({
      quizzes: formattedQuizzes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { message: 'Failed to fetch quizzes', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const {
      title,
      slug,
      description,
      thumbnail_url,
      difficulty,
      estimated_time,
      passing_score = 70,
      randomize_questions = false,
      randomize_answers = false,
      status = 'draft',
      seo_title,
      seo_description,
      seo_keywords,
      category_ids = []
    } = await request.json();

    // Validation
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    let finalSlug = slug || slugify(title, { lower: true, strict: true });
    
    // Ensure slug is unique
    let slugCheck = await pool.query('SELECT id FROM quizzes WHERE slug = $1', [finalSlug]);
    let slugCounter = 1;
    const originalSlug = finalSlug;
    while (slugCheck.rows.length > 0) {
      finalSlug = `${originalSlug}-${slugCounter}`;
      slugCheck = await pool.query('SELECT id FROM quizzes WHERE slug = $1', [finalSlug]);
      slugCounter++;
    }

    // Get user ID from session
    const userId = session.user?.id ? parseInt(session.user.id.toString()) : null;

    // Insert quiz into database
    const result = await pool.query(
      `INSERT INTO quizzes (
        title, slug, description, thumbnail_url, difficulty, estimated_time,
        passing_score, randomize_questions, randomize_answers, status,
        created_by, seo_title, seo_description, seo_keywords,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        title,
        finalSlug,
        description || null,
        thumbnail_url || null,
        difficulty || null,
        estimated_time || null,
        passing_score,
        randomize_questions,
        randomize_answers,
        status,
        userId,
        seo_title || null,
        seo_description || null,
        seo_keywords || null
      ]
    );

    const newQuiz = result.rows[0];

    // Add category assignments if provided
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await pool.query(
          'INSERT INTO quiz_category_assignments (quiz_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newQuiz.id, categoryId]
        );
      }
    }

    // Format the response
    const formattedQuiz = {
      ...newQuiz,
      created_at: newQuiz.created_at ? new Date(newQuiz.created_at).toISOString() : null,
      updated_at: newQuiz.updated_at ? new Date(newQuiz.updated_at).toISOString() : null
    };

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: formattedQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { message: 'Failed to create quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

