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

    // Fetch interview from database
    const { rows } = await pool.query(
      `SELECT 
        i.*,
        u.name as interviewer_name,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo,
        g.bio as guest_bio,
        g.title as guest_title,
        g.company as guest_company,
        g.social_links as guest_social_links,
        c.name as category_name
      FROM interviews i
      LEFT JOIN users u ON i.interviewer_id = u.id
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      LEFT JOIN interview_categories c ON i.category_id = c.id
      WHERE i.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
    }

    const interview = rows[0];

    // Format dates
    interview.created_at = interview.created_at ? new Date(interview.created_at).toISOString() : null;
    interview.updated_at = interview.updated_at ? new Date(interview.updated_at).toISOString() : null;
    interview.publish_date = interview.publish_date ? new Date(interview.publish_date).toISOString() : null;
    interview.schedule_date = interview.schedule_date ? new Date(interview.schedule_date).toISOString() : null;
    interview.content = interview.content || {};
    interview.tags = Array.isArray(interview.tags) ? interview.tags : [];

    return NextResponse.json({ interview });
  } catch (error) {
    console.error('Error fetching interview:', error);
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
      title,
      slug,
      excerpt,
      content,
      guest_id,
      category_id,
      interview_type,
      featured_image,
      featured_image_alt,
      meta_title,
      meta_description,
      seo_keywords,
      schema_json,
      tags,
      status,
      featured,
      schedule_date
    } = await request.json();

    // Check if interview exists
    const existingInterview = await pool.query(
      'SELECT id FROM interviews WHERE id = $1',
      [id]
    );

    if (existingInterview.rows.length === 0) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
    }

    // Check if slug already exists (if changed)
    if (slug) {
      const slugCheck = await pool.query(
        'SELECT id FROM interviews WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'Interview with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }
    if (slug !== undefined) {
      updateFields.push(`slug = $${paramIndex++}`);
      updateValues.push(slug);
    }
    if (excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramIndex++}`);
      updateValues.push(excerpt);
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      updateValues.push(JSON.stringify(content));
    }
    if (guest_id !== undefined) {
      updateFields.push(`guest_id = $${paramIndex++}`);
      updateValues.push(guest_id || null);
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateValues.push(category_id || null);
    }
    if (interview_type !== undefined) {
      updateFields.push(`interview_type = $${paramIndex++}`);
      updateValues.push(interview_type);
    }
    if (featured_image !== undefined) {
      updateFields.push(`featured_image = $${paramIndex++}`);
      updateValues.push(featured_image || null);
    }
    if (featured_image_alt !== undefined) {
      updateFields.push(`featured_image_alt = $${paramIndex++}`);
      updateValues.push(featured_image_alt || null);
    }
    if (meta_title !== undefined) {
      updateFields.push(`meta_title = $${paramIndex++}`);
      updateValues.push(meta_title || null);
    }
    if (meta_description !== undefined) {
      updateFields.push(`meta_description = $${paramIndex++}`);
      updateValues.push(meta_description || null);
    }
    if (seo_keywords !== undefined) {
      updateFields.push(`seo_keywords = $${paramIndex++}`);
      updateValues.push(seo_keywords || null);
    }
    if (schema_json !== undefined) {
      updateFields.push(`schema_json = $${paramIndex++}`);
      updateValues.push(schema_json ? JSON.stringify(schema_json) : null);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      updateValues.push(JSON.stringify(tags));
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
      
      // If status is being set to published and publish_date is not set, set it
      if (status === 'published') {
        updateFields.push(`publish_date = COALESCE(publish_date, CURRENT_TIMESTAMP)`);
      }
    }
    if (featured !== undefined) {
      updateFields.push(`featured = $${paramIndex++}`);
      updateValues.push(featured);
    }
    if (schedule_date !== undefined) {
      updateFields.push(`schedule_date = $${paramIndex++}`);
      updateValues.push(schedule_date || null);
    }

    // Always update updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(id);

    const query = `
      UPDATE interviews
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, updateValues);
    const updatedInterview = result.rows[0];

    // Format dates
    updatedInterview.created_at = updatedInterview.created_at ? new Date(updatedInterview.created_at).toISOString() : null;
    updatedInterview.updated_at = updatedInterview.updated_at ? new Date(updatedInterview.updated_at).toISOString() : null;
    updatedInterview.publish_date = updatedInterview.publish_date ? new Date(updatedInterview.publish_date).toISOString() : null;
    updatedInterview.schedule_date = updatedInterview.schedule_date ? new Date(updatedInterview.schedule_date).toISOString() : null;
    updatedInterview.content = updatedInterview.content || {};
    updatedInterview.tags = Array.isArray(updatedInterview.tags) ? updatedInterview.tags : [];

    return NextResponse.json({
      message: 'Interview updated successfully',
      interview: updatedInterview
    });
  } catch (error) {
    console.error('Error updating interview:', error);
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

    // Check if interview exists
    const existingInterview = await pool.query(
      'SELECT id FROM interviews WHERE id = $1',
      [id]
    );

    if (existingInterview.rows.length === 0) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
    }

    // Delete interview
    await pool.query('DELETE FROM interviews WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

