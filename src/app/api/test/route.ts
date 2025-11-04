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
    // Test database connection
    const connectionResult = await pool.query('SELECT 1 as connection_test');
    
    // Check if tables exist
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    // Get user count
    const usersResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
    
    // Get some sample data from tables
    const categoriesResult = await pool.query('SELECT * FROM categories LIMIT 5');
    
    return NextResponse.json({
      status: 'success',
      connection: connectionResult.rows[0],
      tables: tablesResult.rows.map(row => row.table_name),
      userCount: usersResult.rows[0].user_count,
      categories: categoriesResult.rows,
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  } finally {
    // Don't end the pool here as it will be reused in a serverless environment
  }
} 
