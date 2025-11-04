import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/users/[id]/posts - Get user's posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        fp.*,
        ft.title as thread_title,
        ft.slug as thread_slug,
        fc.name as category_name,
        fc.slug as category_slug,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.post_id = fp.id) as like_count
       FROM forum_posts fp
       JOIN forum_threads ft ON ft.id = fp.thread_id
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE fp.user_id = $1
       ORDER BY fp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM forum_posts WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].total);

    const posts = result.rows.map((row) => ({
      id: row.id,
      thread_id: row.thread_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_edited: row.is_edited,
      edited_at: row.edited_at,
      thread: {
        id: row.thread_id,
        title: row.thread_title,
        slug: row.thread_slug,
      },
      category: {
        name: row.category_name,
        slug: row.category_slug,
      },
      like_count: parseInt(row.like_count) || 0,
    }));

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}

