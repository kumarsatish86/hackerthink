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

// GET /api/forum/notifications/unread-count - Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM forum_notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [user.id]
    );

    const unreadCount = parseInt(result.rows[0].count) || 0;

    return NextResponse.json({ unread_count: unreadCount });
  } catch (error: any) {
    console.error('Error fetching unread notification count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch unread count' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

