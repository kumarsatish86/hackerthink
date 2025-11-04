import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAdmin, requireModerator } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// POST /api/forum/threads/[id]/lock - Lock/unlock a thread (admin/moderator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator();
    const { id } = await params;
    const threadId = parseInt(id);

    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_locked } = body;

    if (typeof is_locked !== 'boolean') {
      return NextResponse.json(
        { error: 'is_locked must be a boolean' },
        { status: 400 }
      );
    }

    // Check if thread exists
    const threadCheck = await pool.query(
      'SELECT id FROM forum_threads WHERE id = $1',
      [threadId]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE forum_threads
       SET is_locked = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [is_locked, threadId]
    );

    return NextResponse.json({ thread: result.rows[0] });
  } catch (error: any) {
    console.error('Error locking/unlocking forum thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update thread lock status' },
      { status: error.message?.includes('Unauthorized') || error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

