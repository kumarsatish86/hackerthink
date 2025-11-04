import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAuth, requireModerator } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT 
        fp.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        u.forum_reputation as author_reputation,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.post_id = fp.id) as like_count
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       WHERE fp.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const post = {
      id: row.id,
      thread_id: row.thread_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_edited: row.is_edited,
      edited_at: row.edited_at,
      author: {
        id: row.user_id,
        name: row.author_name,
        avatar_url: row.author_avatar,
        reputation: row.author_reputation,
      },
      like_count: parseInt(row.like_count) || 0,
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if post exists and user has permission
    const postCheck = await pool.query(
      `SELECT fp.user_id, fp.thread_id, ft.is_locked
       FROM forum_posts fp
       JOIN forum_threads ft ON ft.id = fp.thread_id
       WHERE fp.id = $1`,
      [postId]
    );

    if (postCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postCheck.rows[0];
    const isOwner = post.user_id === user.id;
    const isModerator = user.role === 'admin';

    // Try to check if user is moderator
    try {
      await requireModerator();
      // If no error, user is moderator
    } catch {
      // User is not moderator
    }

    if (!isOwner && !isModerator && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this post' },
        { status: 403 }
      );
    }

    if (post.is_locked && !isModerator && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot edit post in locked thread' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `UPDATE forum_posts
       SET content = $1, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content, postId]
    );

    return NextResponse.json({ post: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating forum post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/forum/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists and user has permission
    const postCheck = await pool.query(
      `SELECT fp.user_id, fp.thread_id, ft.user_id as thread_creator_id
       FROM forum_posts fp
       JOIN forum_threads ft ON ft.id = fp.thread_id
       WHERE fp.id = $1`,
      [postId]
    );

    if (postCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postCheck.rows[0];
    const isOwner = post.user_id === user.id;
    const isThreadCreator = post.thread_creator_id === user.id;
    const isModerator = user.role === 'admin';

    // Try to check if user is moderator
    try {
      await requireModerator();
      // If no error, user is moderator
    } catch {
      // User is not moderator
    }

    if (!isOwner && !isThreadCreator && !isModerator && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this post' },
        { status: 403 }
      );
    }

    await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

