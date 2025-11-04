import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { requireAuth } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/users/[id]/profile - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT 
        id,
        name,
        email,
        avatar_url,
        bio,
        location,
        social_links,
        last_active,
        forum_reputation,
        forum_post_count,
        created_at,
        updated_at,
        is_banned,
        ban_expires_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    user.social_links = typeof user.social_links === 'string' 
      ? JSON.parse(user.social_links) 
      : user.social_links || {};

    // Don't return email unless it's the current user
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? parseInt(session.user.id as string) : null;
    
    if (currentUserId !== userId) {
      delete user.email;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT /api/forum/users/[id]/profile - Update user profile (own profile only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { avatar_url, bio, location, social_links } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatar_url || null);
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio || null);
    }

    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(location || null);
    }

    if (social_links !== undefined) {
      updates.push(`social_links = $${paramIndex++}`);
      values.push(JSON.stringify(social_links || {}));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];
    updatedUser.social_links = typeof updatedUser.social_links === 'string' 
      ? JSON.parse(updatedUser.social_links) 
      : updatedUser.social_links || {};

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user profile' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

