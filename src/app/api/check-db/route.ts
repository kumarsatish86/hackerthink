import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a simple connection for testing
const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
  max: 1, // Use only one connection
  idleTimeoutMillis: 10000, // Close idle connections after 10 seconds
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds
});

export async function GET() {
  try {
    // Simple query to test the connection
    const result = await testPool.query('SELECT NOW() as time');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      time: result.rows[0].time,
      connectionString: `postgres://${process.env.DB_USER || 'postgres'}:***@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'ainews'}`
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: String(error)
    }, { status: 500 });
  } finally {
    // Always end the pool after use
    await testPool.end();
  }
} 
