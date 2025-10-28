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

    // Fetch all redirects
    const { rows } = await pool.query(`
      SELECT * FROM url_redirects
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ redirects: rows });
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { source_url, target_url, redirect_type = 301, is_active = true, notes = '' } = body;

    // Basic validation
    if (!source_url) {
      return NextResponse.json(
        { message: 'Source URL is required' },
        { status: 400 }
      );
    }

    if (!target_url) {
      return NextResponse.json(
        { message: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Normalize URLs - ensure they start with /
    const normalizedSourceUrl = source_url.startsWith('/') ? source_url : `/${source_url}`;
    const normalizedTargetUrl = target_url.startsWith('/') || target_url.startsWith('http') 
      ? target_url 
      : `/${target_url}`;

    // Check for duplicate source URL
    const existingCheck = await pool.query(
      'SELECT id FROM url_redirects WHERE source_url = $1',
      [normalizedSourceUrl]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { message: 'A redirect with this source URL already exists' },
        { status: 400 }
      );
    }

    // Insert new redirect
    const result = await pool.query(
      `INSERT INTO url_redirects (
        source_url, 
        target_url, 
        redirect_type,
        is_active, 
        notes,
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        normalizedSourceUrl,
        normalizedTargetUrl,
        redirect_type,
        is_active,
        notes
      ]
    );

    const newRedirect = result.rows[0];

    return NextResponse.json(
      { message: 'Redirect created successfully', redirect: newRedirect },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating redirect:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 
