import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || 'all';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const offset = (page - 1) * limit;
    let whereConditions: string[] = ["q.status = 'published'"];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(q.title ILIKE $${paramIndex} OR q.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (difficulty !== 'all') {
      whereConditions.push(`q.difficulty = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    if (category !== 'all') {
      whereConditions.push(`qc.slug = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT q.id) as total 
      FROM quizzes q
      LEFT JOIN quiz_category_assignments qca ON q.id = qca.quiz_id
      LEFT JOIN quiz_categories qc ON qca.category_id = qc.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get quizzes with pagination
    const validSortColumns = ['created_at', 'title', 'difficulty'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT DISTINCT
        q.*,
        COUNT(DISTINCT qq.id) as question_count,
        ARRAY_AGG(DISTINCT qc.name) FILTER (WHERE qc.name IS NOT NULL) as category_names,
        ARRAY_AGG(DISTINCT qc.slug) FILTER (WHERE qc.slug IS NOT NULL) as category_slugs
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      LEFT JOIN quiz_category_assignments qca ON q.id = qca.quiz_id
      LEFT JOIN quiz_categories qc ON qca.category_id = qc.id
      ${whereClause}
      GROUP BY q.id
      ORDER BY q.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const { rows: quizzes } = await pool.query(query, queryParams);

    // Format the quizzes data
    const formattedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      created_at: quiz.created_at ? new Date(quiz.created_at).toISOString() : null,
      updated_at: quiz.updated_at ? new Date(quiz.updated_at).toISOString() : null,
      question_count: parseInt(quiz.question_count) || 0,
      category_names: quiz.category_names || [],
      category_slugs: quiz.category_slugs || []
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

