import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAdmin } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// POST /api/forum/admin/users/[id]/role - Assign forum role to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role_id, action } = body; // action: 'assign' or 'remove'

    if (!role_id || !action) {
      return NextResponse.json(
        { error: 'role_id and action are required' },
        { status: 400 }
      );
    }

    if (!['assign', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "assign" or "remove"' },
        { status: 400 }
      );
    }

    // Check if role exists
    const roleCheck = await pool.query(
      'SELECT id FROM forum_roles WHERE id = $1',
      [role_id]
    );

    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'assign') {
      // Check if already assigned
      const existingCheck = await pool.query(
        'SELECT id FROM user_forum_roles WHERE user_id = $1 AND role_id = $2',
        [userId, role_id]
      );

      if (existingCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'Role already assigned' },
          { status: 200 }
        );
      }

      const result = await pool.query(
        `INSERT INTO user_forum_roles (user_id, role_id, assigned_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, role_id, user.id]
      );

      return NextResponse.json({ user_role: result.rows[0] }, { status: 201 });
    } else {
      // Remove role
      const result = await pool.query(
        `DELETE FROM user_forum_roles
         WHERE user_id = $1 AND role_id = $2
         RETURNING *`,
        [userId, role_id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Role assignment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Role removed successfully' });
    }
  } catch (error: any) {
    console.error('Error assigning/removing role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign/remove role' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

