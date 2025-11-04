import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET() {
  try {
    const session = await getServerSession();
    
    let dbUser = null;
    if (session?.user?.email) {
      const result = await pool.query(
        'SELECT id, name, email, role FROM users WHERE email = $1',
        [session.user.email]
      );
      
      if (result.rows.length > 0) {
        dbUser = result.rows[0];
      }
    }
    
    return NextResponse.json({
      sessionExists: !!session,
      sessionData: session,
      dbUser: dbUser,
      timestamp: new Date().toISOString(),
      updateRoleUrl: `/api/admin/auth/fix-admin?role=admin`,
      allowedRoles: ['admin', 'editor', 'author', 'instructor']
    });
  } catch (error) {
    console.error('Error in debug-session:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
