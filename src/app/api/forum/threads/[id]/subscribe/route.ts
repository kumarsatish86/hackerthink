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

// POST /api/forum/threads/[id]/subscribe - Subscribe to a thread
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

    // Check if already subscribed
    const existingCheck = await pool.query(
      'SELECT id FROM forum_subscriptions WHERE user_id = $1 AND thread_id = $2',
      [user.id, threadId]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { message: 'Already subscribed to this thread' },
        { status: 200 }
      );
    }

    const result = await pool.query(
      `INSERT INTO forum_subscriptions (user_id, thread_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user.id, threadId]
    );

    return NextResponse.json({ subscription: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error subscribing to thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe to thread' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/forum/threads/[id]/subscribe - Unsubscribe from a thread
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

    const result = await pool.query(
      `DELETE FROM forum_subscriptions
       WHERE user_id = $1 AND thread_id = $2
       RETURNING *`,
      [user.id, threadId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Unsubscribed from thread' });
  } catch (error: any) {
    console.error('Error unsubscribing from thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsubscribe from thread' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

