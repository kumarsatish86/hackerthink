import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET - Fetch a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Resolve params
    const { id } = await params;

    // Fetch user from database - handle both INTEGER and UUID types
    // Use text comparison which works for both UUID and INTEGER when cast to text
    const { rows } = await pool.query(
      `SELECT 
        id::text as id, 
        name, 
        email, 
        role, 
        bio,
        avatar_url,
        created_at, 
        updated_at
      FROM users
      WHERE id::text = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    // Format dates
    const formattedUser = {
      ...user,
      created_at: new Date(user.created_at).toISOString(),
      updated_at: new Date(user.updated_at).toISOString(),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Resolve params
    const { id } = await params;
    const body = await request.json();

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;
    
    // Handle both INTEGER and UUID types for id - use text comparison

    if (body.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(body.name);
    }

    if (body.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(body.email);
    }

    if (body.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(body.role);
    }

    if (body.bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      updateValues.push(body.bio);
    }

    if (body.avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex++}`);
      updateValues.push(body.avatar_url);
    }

    if (body.password !== undefined && body.password !== '') {
      // Hash the password if provided
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateFields.push(`password = $${paramIndex++}`);
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    // Use text comparison which works for both UUID and INTEGER
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id::text = $${paramIndex}
      RETURNING id::text as id, name, email, role, bio, avatar_url, created_at, updated_at
    `;

    const { rows } = await pool.query(query, updateValues);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    const formattedUser = {
      ...user,
      created_at: new Date(user.created_at).toISOString(),
      updated_at: new Date(user.updated_at).toISOString(),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Resolve params
    const { id } = await params;

    // Delete user from database - use text comparison which works for both UUID and INTEGER
    const { rows } = await pool.query(
      `DELETE FROM users WHERE id::text = $1 RETURNING id::text as id`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

