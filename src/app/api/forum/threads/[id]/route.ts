import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { requireAuth, requireAdmin } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/threads/[id] - Get a single thread (by ID or slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const threadId = parseInt(id);
    const isSlug = isNaN(threadId);

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id as string) : null;

    // Build query based on whether it's an ID or slug
    const whereClause = isSlug ? 'ft.slug = $1' : 'ft.id = $1';
    const queryParam = isSlug ? id : threadId;

    // Increment view count (only for non-authors)
    if (userId && !isSlug) {
      await pool.query(
        `UPDATE forum_threads 
         SET views = views + 1 
         WHERE id = $1 AND user_id != $2`,
        [threadId, userId]
      );
    } else if (!userId && !isSlug) {
      await pool.query(
        `UPDATE forum_threads 
         SET views = views + 1 
         WHERE id = $1`,
        [threadId]
      );
    } else if (isSlug) {
      // Increment view for slug-based lookup
      await pool.query(
        `UPDATE forum_threads 
         SET views = views + 1 
         WHERE slug = $1${userId ? ' AND user_id != $2' : ''}`,
        userId ? [id, userId] : [id]
      );
    }

    const result = await pool.query(
      `SELECT 
        ft.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        u.forum_reputation as author_reputation,
        fc.name as category_name,
        fc.slug as category_slug,
        (SELECT COUNT(*) FROM forum_subscriptions fs WHERE fs.thread_id = ft.id AND fs.user_id = $2) > 0 as is_subscribed,
        (SELECT COUNT(*) FROM forum_bookmarks fb WHERE fb.thread_id = ft.id AND fb.user_id = $2) > 0 as is_bookmarked
       FROM forum_threads ft
       JOIN users u ON u.id = ft.user_id
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE ${whereClause}`,
      [queryParam, userId || 0]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const thread = {
      id: row.id,
      category_id: row.category_id,
      user_id: row.user_id,
      title: row.title,
      slug: row.slug,
      created_at: row.created_at,
      last_post_at: row.last_post_at,
      views: row.views,
      post_count: row.post_count,
      is_locked: row.is_locked,
      is_sticky: row.is_sticky,
      is_solved: row.is_solved,
      solved_post_id: row.solved_post_id,
      updated_at: row.updated_at,
      author: {
        id: row.user_id,
        name: row.author_name,
        avatar_url: row.author_avatar,
        reputation: row.author_reputation,
      },
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
      is_subscribed: row.is_subscribed || false,
      is_bookmarked: row.is_bookmarked || false,
    };

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error fetching forum thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/threads/[id] - Update a thread
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const threadId = parseInt(id);

    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }

    // Check if thread exists and user has permission
    const threadCheck = await pool.query(
      'SELECT user_id, is_locked FROM forum_threads WHERE id = $1',
      [threadId]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadCheck.rows[0];
    const isOwner = thread.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this thread' },
        { status: 403 }
      );
    }

    if (thread.is_locked && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot edit locked thread' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE forum_threads
       SET title = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [title, threadId]
    );

    return NextResponse.json({ thread: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating forum thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update thread' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/forum/threads/[id] - Delete a thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const threadId = parseInt(id);

    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }

    // Check if thread exists and user has permission
    const threadCheck = await pool.query(
      'SELECT user_id FROM forum_threads WHERE id = $1',
      [threadId]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadCheck.rows[0];
    const isOwner = thread.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this thread' },
        { status: 403 }
      );
    }

    await pool.query('DELETE FROM forum_threads WHERE id = $1', [threadId]);

    return NextResponse.json({ message: 'Thread deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting forum thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete thread' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

