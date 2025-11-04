import { NextRequest, NextResponse } from 'next/server';
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
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Fetch all SEO settings
    const { rows } = await pool.query(`
      SELECT * FROM seo_settings
      ORDER BY setting_key ASC
    `);

    // Convert to a more user-friendly format
    const settings = rows.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        id: setting.id
      };
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
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
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { message: 'Invalid request. Settings object is required.' },
        { status: 400 }
      );
    }

    // Update each setting
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          `UPDATE seo_settings
           SET setting_value = $1, 
               updated_at = CURRENT_TIMESTAMP
           WHERE setting_key = $2`,
          [value, key]
        );
      }

      await client.query('COMMIT');
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'SEO settings updated successfully' });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 
