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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get quiz with related data
    const quizResult = await pool.query(
      `SELECT 
        q.*,
        u.name as created_by_name,
        ARRAY_AGG(DISTINCT qc.id) FILTER (WHERE qc.id IS NOT NULL) as category_ids,
        ARRAY_AGG(DISTINCT qc.name) FILTER (WHERE qc.name IS NOT NULL) as category_names
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN quiz_category_assignments qca ON q.id = qca.quiz_id
      LEFT JOIN quiz_categories qc ON qca.category_id = qc.id
      WHERE q.id = $1
      GROUP BY q.id, u.name`,
      [id]
    );

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];

    // Get question count
    const questionCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM quiz_questions WHERE quiz_id = $1',
      [id]
    );
    quiz.question_count = parseInt(questionCountResult.rows[0].count) || 0;

    // Format the response
    const formattedQuiz = {
      ...quiz,
      created_at: quiz.created_at ? new Date(quiz.created_at).toISOString() : null,
      updated_at: quiz.updated_at ? new Date(quiz.updated_at).toISOString() : null,
      category_ids: quiz.category_ids || [],
      category_names: quiz.category_names || []
    };

    return NextResponse.json({ quiz: formattedQuiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { message: 'Failed to fetch quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      passing_score,
      randomize_questions,
      randomize_answers,
      status,
      seo_title,
      seo_description,
      seo_keywords,
      category_ids
    } = await request.json();

    // Check if quiz exists
    const existingQuiz = await pool.query('SELECT id, slug FROM quizzes WHERE id = $1', [id]);
    if (existingQuiz.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Handle slug uniqueness if changed
    let finalSlug = slug || existingQuiz.rows[0].slug;
    if (slug && slug !== existingQuiz.rows[0].slug) {
      finalSlug = slugify(slug, { lower: true, strict: true });
      let slugCheck = await pool.query('SELECT id FROM quizzes WHERE slug = $1 AND id != $2', [finalSlug, id]);
      let slugCounter = 1;
      const originalSlug = finalSlug;
      while (slugCheck.rows.length > 0) {
        finalSlug = `${originalSlug}-${slugCounter}`;
        slugCheck = await pool.query('SELECT id FROM quizzes WHERE slug = $1 AND id != $2', [finalSlug, id]);
        slugCounter++;
      }
    }

    // Update quiz
    const result = await pool.query(
      `UPDATE quizzes SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        thumbnail_url = COALESCE($4, thumbnail_url),
        difficulty = COALESCE($5, difficulty),
        estimated_time = COALESCE($6, estimated_time),
        passing_score = COALESCE($7, passing_score),
        randomize_questions = COALESCE($8, randomize_questions),
        randomize_answers = COALESCE($9, randomize_answers),
        status = COALESCE($10, status),
        seo_title = COALESCE($11, seo_title),
        seo_description = COALESCE($12, seo_description),
        seo_keywords = COALESCE($13, seo_keywords),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [
        title || null,
        finalSlug || null,
        description !== undefined ? description : null,
        thumbnail_url !== undefined ? thumbnail_url : null,
        difficulty || null,
        estimated_time || null,
        passing_score || null,
        randomize_questions !== undefined ? randomize_questions : null,
        randomize_answers !== undefined ? randomize_answers : null,
        status || null,
        seo_title !== undefined ? seo_title : null,
        seo_description !== undefined ? seo_description : null,
        seo_keywords !== undefined ? seo_keywords : null,
        id
      ]
    );

    // Update category assignments if provided
    if (Array.isArray(category_ids)) {
      // Remove all existing assignments
      await pool.query('DELETE FROM quiz_category_assignments WHERE quiz_id = $1', [id]);
      
      // Add new assignments
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await pool.query(
            'INSERT INTO quiz_category_assignments (quiz_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }
    }

    const updatedQuiz = result.rows[0];

    // Format the response
    const formattedQuiz = {
      ...updatedQuiz,
      created_at: updatedQuiz.created_at ? new Date(updatedQuiz.created_at).toISOString() : null,
      updated_at: updatedQuiz.updated_at ? new Date(updatedQuiz.updated_at).toISOString() : null
    };

    return NextResponse.json({
      message: 'Quiz updated successfully',
      quiz: formattedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { message: 'Failed to update quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if quiz exists
    const existingQuiz = await pool.query('SELECT id FROM quizzes WHERE id = $1', [id]);
    if (existingQuiz.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Delete quiz (cascade will handle related records)
    await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { message: 'Failed to delete quiz', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

