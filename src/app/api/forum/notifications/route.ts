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

// GET /api/forum/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = `
      SELECT *
      FROM forum_notifications
      WHERE user_id = $1
    `;

    const params: any[] = [user.id];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM forum_notifications WHERE user_id = $1`;
    const countParams: any[] = [user.id];

    if (unreadOnly) {
      countQuery += ` AND is_read = FALSE`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      notifications: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/forum/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { notification_ids, mark_all_read } = body;

    if (mark_all_read) {
      await pool.query(
        `UPDATE forum_notifications
         SET is_read = TRUE
         WHERE user_id = $1 AND is_read = FALSE`,
        [user.id]
      );

      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (notification_ids && Array.isArray(notification_ids)) {
      await pool.query(
        `UPDATE forum_notifications
         SET is_read = TRUE
         WHERE id = ANY($1) AND user_id = $2`,
        [notification_ids, user.id]
      );

      return NextResponse.json({ message: 'Notifications marked as read' });
    }

    return NextResponse.json(
      { error: 'notification_ids array or mark_all_read required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notifications as read' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

