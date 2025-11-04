import { NextResponse } from 'next/server';
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
    const { rows } = await pool.query(
      'SELECT COUNT(*) as admin_count FROM users WHERE role = $1',
      ['admin']
    );
    
    const adminCount = parseInt(rows[0].admin_count);
    
    return NextResponse.json({
      hasAdmin: adminCount > 0
    });
  } catch (error: any) {
    console.error('Error checking admin accounts:', error);
    return NextResponse.json(
      { message: 'Error checking admin accounts', error: error.message },
      { status: 500 }
    );
  }
} 
