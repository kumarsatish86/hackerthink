import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET() {
  try {
    // Check authentication - in a production app, add role-based authorization
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users from database
    const { rows } = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at as "joinedDate",
        updated_at as "lastActive",
        CASE WHEN role = 'inactive' THEN 'inactive' ELSE 'active' END as status
      FROM users
      ORDER BY created_at DESC
    `);

    // Format dates for display
    const users = rows.map(user => ({
      ...user,
      joinedDate: new Date(user.joinedDate).toISOString().split('T')[0],
      lastActive: new Date(user.lastActive).toISOString().split('T')[0]
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
