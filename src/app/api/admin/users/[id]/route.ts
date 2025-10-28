import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Fetch user from database
    const { rows } = await pool.query(
      `SELECT id, name, email, role, avatar_url, bio, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const data = await request.json();
    const { name, email, role, bio, password } = data;

    // Build the query
    let query = 'UPDATE users SET ';
    let queryParams: any[] = [];
    let paramCount = 1;

    if (name) {
      query += `name = $${paramCount}, `;
      queryParams.push(name);
      paramCount++;
    }

    if (email) {
      query += `email = $${paramCount}, `;
      queryParams.push(email);
      paramCount++;
    }

    if (role) {
      query += `role = $${paramCount}, `;
      queryParams.push(role);
      paramCount++;
    }

    if (bio !== undefined) {
      query += `bio = $${paramCount}, `;
      queryParams.push(bio);
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `password = $${paramCount}, `;
      queryParams.push(hashedPassword);
      paramCount++;
    }

    // Add updated_at
    query += `updated_at = CURRENT_TIMESTAMP `;

    // Add WHERE clause and finalize query
    query += `WHERE id = $${paramCount} RETURNING id, name, email, role, bio, updated_at`;
    queryParams.push(userId);

    // Execute the query
    const { rows } = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Delete user from database
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 