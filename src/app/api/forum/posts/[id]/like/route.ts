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

// POST /api/forum/posts/[id]/like - Like a post
export async function POST(
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

    // Check if post exists
    const postCheck = await pool.query(
      'SELECT id, user_id FROM forum_posts WHERE id = $1',
      [postId]
    );

    if (postCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingCheck = await pool.query(
      'SELECT id FROM forum_likes WHERE user_id = $1 AND post_id = $2',
      [user.id, postId]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { message: 'Post already liked' },
        { status: 200 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create like
      await client.query(
        `INSERT INTO forum_likes (user_id, post_id)
         VALUES ($1, $2)`,
        [user.id, postId]
      );

      // Create notification for post author (if not self-like)
      const post = postCheck.rows[0];
      if (post.user_id !== user.id) {
        await client.query(
          `INSERT INTO forum_notifications (user_id, type, reference_id, message)
           VALUES ($1, 'like', $2, $3)`,
          [
            post.user_id,
            postId,
            'Your post received a like',
          ]
        );
      }

      await client.query('COMMIT');

      // Get updated like count
      const likeCountResult = await client.query(
        'SELECT COUNT(*) as count FROM forum_likes WHERE post_id = $1',
        [postId]
      );

      return NextResponse.json({
        message: 'Post liked successfully',
        like_count: parseInt(likeCountResult.rows[0].count),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to like post' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/forum/posts/[id]/like - Unlike a post
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

    const result = await pool.query(
      `DELETE FROM forum_likes
       WHERE user_id = $1 AND post_id = $2
       RETURNING *`,
      [user.id, postId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Like not found' },
        { status: 404 }
      );
    }

    // Get updated like count
    const likeCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM forum_likes WHERE post_id = $1',
      [postId]
    );

    return NextResponse.json({
      message: 'Post unliked successfully',
      like_count: parseInt(likeCountResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlike post' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

