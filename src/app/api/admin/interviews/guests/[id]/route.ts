import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch guest from database
    const { rows } = await pool.query(
      'SELECT * FROM interview_guests WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    }

    const guest = rows[0];

    // Format dates and JSON fields
    guest.created_at = guest.created_at ? new Date(guest.created_at).toISOString() : null;
    guest.updated_at = guest.updated_at ? new Date(guest.updated_at).toISOString() : null;
    guest.social_links = guest.social_links || {};

    return NextResponse.json({ guest });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
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
      verified
    } = await request.json();

    // Check if guest exists
    const existingGuest = await pool.query(
      'SELECT id FROM interview_guests WHERE id = $1',
      [id]
    );

    if (existingGuest.rows.length === 0) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    }

    // Check if slug already exists (if changed)
    if (slug) {
      const slugCheck = await pool.query(
        'SELECT id FROM interview_guests WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'Guest with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }
    if (slug !== undefined) {
      updateFields.push(`slug = $${paramIndex++}`);
      updateValues.push(slug);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      updateValues.push(bio || null);
    }
    if (photo_url !== undefined) {
      updateFields.push(`photo_url = $${paramIndex++}`);
      updateValues.push(photo_url || null);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title || null);
    }
    if (company !== undefined) {
      updateFields.push(`company = $${paramIndex++}`);
      updateValues.push(company || null);
    }
    if (company_url !== undefined) {
      updateFields.push(`company_url = $${paramIndex++}`);
      updateValues.push(company_url || null);
    }
    if (designation !== undefined) {
      updateFields.push(`designation = $${paramIndex++}`);
      updateValues.push(designation || null);
    }
    if (social_links !== undefined) {
      updateFields.push(`social_links = $${paramIndex++}`);
      updateValues.push(JSON.stringify(social_links || {}));
    }
    if (bio_summary !== undefined) {
      updateFields.push(`bio_summary = $${paramIndex++}`);
      updateValues.push(bio_summary || null);
    }
    if (verified !== undefined) {
      updateFields.push(`verified = $${paramIndex++}`);
      updateValues.push(verified);
    }

    // Always update updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(id);

    const query = `
      UPDATE interview_guests
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, updateValues);
    const updatedGuest = result.rows[0];

    // Format dates and JSON fields
    updatedGuest.created_at = updatedGuest.created_at ? new Date(updatedGuest.created_at).toISOString() : null;
    updatedGuest.updated_at = updatedGuest.updated_at ? new Date(updatedGuest.updated_at).toISOString() : null;
    updatedGuest.social_links = updatedGuest.social_links || {};

    return NextResponse.json({
      message: 'Guest updated successfully',
      guest: updatedGuest
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if guest exists
    const existingGuest = await pool.query(
      'SELECT id FROM interview_guests WHERE id = $1',
      [id]
    );

    if (existingGuest.rows.length === 0) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    }

    // Check if guest has interviews
    const interviewsCheck = await pool.query(
      'SELECT COUNT(*) FROM interviews WHERE guest_id = $1',
      [id]
    );

    if (parseInt(interviewsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete guest with existing interviews' },
        { status: 400 }
      );
    }

    // Delete guest
    await pool.query('DELETE FROM interview_guests WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

