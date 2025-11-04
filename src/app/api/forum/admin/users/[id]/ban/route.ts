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

// POST /api/forum/admin/users/[id]/ban - Ban/unban user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModerator();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_banned, ban_expires_at, reason } = body;

    if (typeof is_banned !== 'boolean') {
      return NextResponse.json(
        { error: 'is_banned must be a boolean' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent banning admins
    if (userCheck.rows[0].role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot ban admin users' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `UPDATE users
       SET is_banned = $1, ban_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [is_banned, ban_expires_at || null, userId]
    );

    return NextResponse.json({ user: result.rows[0] });
  } catch (error: any) {
    console.error('Error banning/unbanning user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ban/unban user' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

