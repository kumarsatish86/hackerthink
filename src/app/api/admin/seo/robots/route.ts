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

    // Fetch robots.txt content from settings
    const { rows } = await pool.query(
      "SELECT setting_value FROM seo_settings WHERE setting_key = 'default_robots_txt'"
    );

    if (rows.length === 0) {
      // Return a default if not set
      return NextResponse.json({ 
        robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml' 
      });
    }

    return NextResponse.json({ robots_txt: rows[0].setting_value });
  } catch (error) {
    console.error('Error fetching robots.txt settings:', error);
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
    const { robots_txt } = body;

    if (robots_txt === undefined) {
      return NextResponse.json(
        { message: 'robots_txt content is required' },
        { status: 400 }
      );
    }

    // Update robots.txt content in settings
    await pool.query(
      "UPDATE seo_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'default_robots_txt'",
      [robots_txt]
    );

    return NextResponse.json({ message: 'robots.txt updated successfully' });
  } catch (error) {
    console.error('Error updating robots.txt settings:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 
