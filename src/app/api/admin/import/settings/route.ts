import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// GET all import settings
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM import_settings ORDER BY source_name');
    return NextResponse.json({ settings: result.rows });
  } catch (error) {
    console.error('Error fetching import settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST create or update import setting
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      source_name, enabled, api_key, auto_approval, import_limit, 
      import_interval, schedule_cron, filters
    } = data;

    // Check if setting exists
    const existing = await pool.query(
      'SELECT id FROM import_settings WHERE source_name = $1',
      [source_name]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE import_settings 
         SET enabled = $1, api_key = $2, auto_approval = $3, import_limit = $4,
             import_interval = $5, schedule_cron = $6, filters = $7, updated_at = CURRENT_TIMESTAMP
         WHERE source_name = $8
         RETURNING *`,
        [enabled, api_key, auto_approval, import_limit, import_interval, schedule_cron, JSON.stringify(filters), source_name]
      );
    } else {
      // Create new
      result = await pool.query(
        `INSERT INTO import_settings 
         (source_name, enabled, api_key, auto_approval, import_limit, import_interval, schedule_cron, filters)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [source_name, enabled, api_key, auto_approval, import_limit, import_interval, schedule_cron, JSON.stringify(filters)]
      );
    }

    return NextResponse.json({ setting: result.rows[0] });
  } catch (error) {
    console.error('Error saving import settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

