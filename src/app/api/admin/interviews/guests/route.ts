import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all guests with interview count
    const { rows: guests } = await pool.query(`
      SELECT 
        g.*,
        COUNT(i.id) as interview_count
      FROM interview_guests g
      LEFT JOIN interviews i ON g.id = i.guest_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);

    // Format the guests data
    const formattedGuests = guests.map(guest => ({
      ...guest,
      created_at: guest.created_at ? new Date(guest.created_at).toISOString() : null,
      updated_at: guest.updated_at ? new Date(guest.updated_at).toISOString() : null,
      social_links: guest.social_links || {},
      interview_count: parseInt(guest.interview_count) || 0
    }));

    return NextResponse.json({ guests: formattedGuests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({
      message: 'Failed to fetch guests',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      slug,
      bio,
      photo_url,
      title,
      company,
      company_url,
      designation,
      social_links,
      bio_summary,
      verified = false
    } = await request.json();

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

    // Check if slug already exists
    const existingSlug = await pool.query(
      'SELECT * FROM interview_guests WHERE slug = $1',
      [finalSlug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { message: 'Guest with this slug already exists' },
        { status: 409 }
      );
    }

    // Insert guest into database
    const result = await pool.query(
      `INSERT INTO interview_guests (
        name,
        slug,
        bio,
        photo_url,
        title,
        company,
        company_url,
        designation,
        social_links,
        bio_summary,
        verified,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        name,
        finalSlug,
        bio || null,
        photo_url || null,
        title || null,
        company || null,
        company_url || null,
        designation || null,
        social_links ? JSON.stringify(social_links) : '{}',
        bio_summary || null,
        verified
      ]
    );

    const newGuest = result.rows[0];

    // Format dates
    newGuest.created_at = newGuest.created_at ? new Date(newGuest.created_at).toISOString() : null;
    newGuest.updated_at = newGuest.updated_at ? new Date(newGuest.updated_at).toISOString() : null;
    newGuest.social_links = newGuest.social_links || {};

    return NextResponse.json(
      { message: 'Guest created successfully', guest: newGuest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

