import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Set nodejs runtime for API route
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[Debug] Testing database connection...');
    
    // Test database connection
    const connectionTest = await pool.query('SELECT NOW() as time');
    const connectionTestResult = connectionTest.rows[0];
    
    // Get all redirects
    const redirectsResult = await pool.query(
      'SELECT id, source_url, target_url, redirect_type, is_active, notes, created_at, updated_at FROM url_redirects'
    );
    
    // Count active and inactive redirects
    const activeRedirects = redirectsResult.rows.filter(row => row.is_active);
    const inactiveRedirects = redirectsResult.rows.filter(row => !row.is_active);
    
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'url_redirects'
      ORDER BY ordinal_position
    `);
    
    // Check if the testing redirect exists
    const testingRedirect = redirectsResult.rows.find(row => row.source_url === '/testing');
    
    // Check if the schema_json column exists in the articles table
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `);
    
    // Check for an article with schema_json
    const { rows: sampleArticles } = await pool.query(`
      SELECT id, title, schema_json
      FROM articles
      LIMIT 5
    `);
    
    return NextResponse.json({
      status: 'success',
      database: {
        connection: {
          time: connectionTestResult.time,
          success: true
        },
        redirects: {
          total: redirectsResult.rows.length,
          active: activeRedirects.length,
          inactive: inactiveRedirects.length,
          list: redirectsResult.rows
        },
        table: {
          structure: tableStructure.rows
        },
        testingRedirect: testingRedirect || 'Not found in database'
      },
      columns: columnInfo,
      sampleArticles
    });
  } catch (error) {
    console.error('[Debug] Database error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: String(error)
    }, { status: 500 });
  }
} 
