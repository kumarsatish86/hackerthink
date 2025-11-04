import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAuth } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/bookmarks - List bookmarked threads
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        fb.*,
        ft.title,
        ft.slug,
        ft.post_count,
        ft.views,
        ft.last_post_at,
        ft.is_locked,
        ft.is_sticky,
        fc.name as category_name,
        fc.slug as category_slug
       FROM forum_bookmarks fb
       JOIN forum_threads ft ON ft.id = fb.thread_id
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE fb.user_id = $1
       ORDER BY fb.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM forum_bookmarks WHERE user_id = $1',
      [user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    const bookmarks = result.rows.map((row) => ({
      id: row.id,
      thread_id: row.thread_id,
      created_at: row.created_at,
      thread: {
        id: row.thread_id,
        title: row.title,
        slug: row.slug,
        post_count: row.post_count,
        views: row.views,
        last_post_at: row.last_post_at,
        is_locked: row.is_locked,
        is_sticky: row.is_sticky,
      },
      category: {
        name: row.category_name,
        slug: row.category_slug,
      },
    }));

    return NextResponse.json({
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookmarks' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/forum/bookmarks - Add bookmark
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { thread_id } = body;

    if (!thread_id) {
      return NextResponse.json(
        { error: 'thread_id is required' },
        { status: 400 }
      );
    }

    // Check if thread exists
    const threadCheck = await pool.query(
      'SELECT id FROM forum_threads WHERE id = $1',
      [thread_id]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingCheck = await pool.query(
      'SELECT id FROM forum_bookmarks WHERE user_id = $1 AND thread_id = $2',
      [user.id, thread_id]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { message: 'Thread already bookmarked' },
        { status: 200 }
      );
    }

    const result = await pool.query(
      `INSERT INTO forum_bookmarks (user_id, thread_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user.id, thread_id]
    );

    return NextResponse.json({ bookmark: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add bookmark' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/forum/bookmarks - Remove bookmark
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const thread_id = searchParams.get('thread_id');

    if (!thread_id) {
      return NextResponse.json(
        { error: 'thread_id is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM forum_bookmarks
       WHERE user_id = $1 AND thread_id = $2
       RETURNING *`,
      [user.id, parseInt(thread_id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Bookmark removed' });
  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove bookmark' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

