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

// POST /api/forum/threads/[id]/solve - Mark thread as solved (thread creator only)
export async function POST(
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

    const body = await request.json();
    const { is_solved, solved_post_id } = body;

    // Check if thread exists and user is the creator
    const threadCheck = await pool.query(
      'SELECT user_id, is_solved FROM forum_threads WHERE id = $1',
      [threadId]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadCheck.rows[0];

    if (thread.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the thread creator can mark it as solved' },
        { status: 403 }
      );
    }

    // If marking as solved, verify the post exists and belongs to the thread
    if (is_solved && solved_post_id) {
      const postCheck = await pool.query(
        'SELECT id FROM forum_posts WHERE id = $1 AND thread_id = $2',
        [solved_post_id, threadId]
      );

      if (postCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Post not found or does not belong to this thread' },
          { status: 404 }
        );
      }
    }

    const result = await pool.query(
      `UPDATE forum_threads
       SET is_solved = $1, solved_post_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [is_solved || false, solved_post_id || null, threadId]
    );

    return NextResponse.json({ thread: result.rows[0] });
  } catch (error: any) {
    console.error('Error marking thread as solved:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update thread solve status' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

