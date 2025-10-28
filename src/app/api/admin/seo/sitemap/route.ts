import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Fetch sitemap settings
    const { rows } = await pool.query(`
      SELECT setting_key, setting_value 
      FROM seo_settings 
      WHERE setting_key IN (
        'generate_sitemap', 
        'sitemap_change_frequency', 
        'sitemap_priority', 
        'include_in_sitemap'
      )
    `);

    // Convert to object format
    const sitemapSettings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    return NextResponse.json({ sitemap_settings: sitemapSettings });
  } catch (error) {
    console.error('Error fetching sitemap settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { sitemap_settings } = body;

    if (!sitemap_settings || typeof sitemap_settings !== 'object') {
      return NextResponse.json(
        { message: 'Invalid request. sitemap_settings object is required.' },
        { status: 400 }
      );
    }

    // Update each setting
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Allowed settings that can be updated
      const allowedSettings = [
        'generate_sitemap',
        'sitemap_change_frequency',
        'sitemap_priority',
        'include_in_sitemap'
      ];

      for (const [key, value] of Object.entries(sitemap_settings)) {
        if (allowedSettings.includes(key)) {
          await client.query(
            `UPDATE seo_settings
             SET setting_value = $1, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE setting_key = $2`,
            [value, key]
          );
        }
      }

      await client.query('COMMIT');
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Sitemap settings updated successfully' });
  } catch (error) {
    console.error('Error updating sitemap settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 
