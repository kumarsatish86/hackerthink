import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import getConfig from 'next/config';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

// Get server runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Create a database connection pool using server runtime config
const pool = new Pool({
  host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(serverRuntimeConfig.DB_PORT || process.env.DB_PORT || '5432'),
  user: serverRuntimeConfig.DB_USER || process.env.DB_USER || 'postgres',
  password: serverRuntimeConfig.DB_PASSWORD || process.env.DB_PASSWORD || 'Admin1234',
  database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME || 'HackerThink',
});

// GET handler for fetching settings
export async function GET(request: NextRequest) {
  try {
    // Use Next.js built-in URL parsing with searchParams
    const { searchParams } = new URL(request.url || '', 'http://localhost:3007');
    
    // Get keys from query parameters
    let keys: string[] = [];
    const keysParam = searchParams.get('keys') || searchParams.get('key');
    
    if (keysParam) {
      // Clean up any potential spaces and filter out empty strings
      keys = keysParam.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      console.log('[Settings API] Extracted keys:', keys);
    }
    
    // If we still don't have keys, use default keys as fallback
    if (keys.length === 0) {
      console.log('[Settings API] No keys provided, using default keys');
      keys = ['site_name', 'site_description', 'favicon_path'];
    }
    
    let query = `SELECT setting_key, setting_value FROM site_settings`;
    let params: string[] = [];
    
    // If keys are provided, filter by those keys
    if (keys.length > 0) {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      query += ` WHERE setting_key IN (${placeholders})`;
      params = keys;
    }
    
    // Execute the query
    const { rows } = await pool.query(query, params);
    
    // Convert array of objects to a single object with key-value pairs
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {} as Record<string, string>);
    
    // If no settings found in database, return defaults
    if (Object.keys(settings).length === 0) {
      console.log('[Settings API] No settings found in database, returning defaults');
      const defaults: Record<string, string> = {
        site_name: 'HackerThink',
        site_description: 'Learn Linux concepts, scripts, and tutorials',
        favicon_path: '/favicon.ico'
      };
      return NextResponse.json(defaults);
    }
    
    // Return the settings as JSON
    console.log('[Settings API] Successfully returning settings:', Object.keys(settings));
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[Settings API] Error fetching settings:', error);
    
    // Return default values in case of error (but with 200 status for graceful degradation)
    const defaults: Record<string, string> = {
      site_name: 'HackerThink',
      site_description: 'Learn Linux concepts, scripts, and tutorials',
      favicon_path: '/favicon.ico'
    };
    
    console.log('[Settings API] Returning fallback defaults due to error');
    return NextResponse.json(defaults);
  }
}

// POST handler for saving settings
export async function POST(request: NextRequest) {
  try {
    // Get settings from request body
    const settings = await request.json();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          `UPDATE site_settings 
           SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
           WHERE setting_key = $2`,
          [value, key]
        );
      }
      
      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saving settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
