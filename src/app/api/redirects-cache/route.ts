import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize database connection pool - only used in the API route, not middleware
let pool: Pool;

try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin1234',
    database: process.env.DB_NAME || 'ainews',
    connectionTimeoutMillis: 5000, // 5 second timeout
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  });
} catch (error) {
  console.error('[API] Error initializing database pool:', error);
  // Continue without a pool - we'll handle the error in the GET handler
}

// This configuration ensures the API route doesn't run in the Edge runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[API] Fetching active redirects from database...');
    
    // Make sure the pool is initialized
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }
    
    // Query active redirects from database
    const { rows } = await pool.query(
      'SELECT id, source_url, target_url, redirect_type FROM url_redirects WHERE is_active = true'
    );
    
    console.log(`[API] Found ${rows.length} active redirects in database`);
    
    // Format redirects as a simple object for caching in middleware
    const redirects: { [key: string]: { target: string; type: number } } = {};
    for (const row of rows) {
      redirects[row.source_url] = {
        target: row.target_url,
        type: row.redirect_type,
      };
      console.log(`[API] Redirect #${row.id}: "${row.source_url}" -> "${row.target_url}" (${row.redirect_type})`);
    }
    
    // Ensure we have at least the test redirect
    if (!redirects['/testing']) {
      console.log('[API] Adding test redirect: /testing -> /no-reply');
      redirects['/testing'] = { target: '/no-reply', type: 301 };
    }
    
    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('[API] Error fetching redirects:', error);
    
    // Return a fallback with at least the test redirect
    return NextResponse.json(
      { 
        redirects: {
          '/testing': { target: '/no-reply', type: 301 }
        },
        message: 'Using fallback redirects due to database error',
        error: String(error)
      },
      { status: 200 } // Return 200 so middleware can still use fallback data
    );
  }
} 
