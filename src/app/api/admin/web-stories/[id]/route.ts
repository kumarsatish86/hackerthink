import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
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
  database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME || 'hackerthink',
});

// PUT /api/admin/web-stories/[id] - Update web story
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[PUT /api/admin/web-stories/[id]] Starting update request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[PUT /api/admin/web-stories/[id]] Unauthorized - no session');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[PUT /api/admin/web-stories/[id]] Forbidden - not admin');
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const storyId = parseInt(id);

    if (isNaN(storyId)) {
      console.log('[PUT /api/admin/web-stories/[id]] Invalid story ID:', id);
      return NextResponse.json(
        { success: false, message: 'Invalid story ID' },
        { status: 400 }
      );
    }

    console.log('[PUT /api/admin/web-stories/[id]] Parsed story ID:', storyId);

    const data = await request.json();
    const {
      title,
      slug,
      cover_image,
      is_published,
      creation_method,
      content
    } = data;

    const client = await pool.connect();

    try {
      // Check if story exists
      const existingStory = await client.query(
        'SELECT id FROM web_stories WHERE id = $1',
        [storyId]
      );

      if (existingStory.rows.length === 0) {
        console.log('[PUT /api/admin/web-stories/[id]] Story not found with ID:', storyId);
        return NextResponse.json(
          { success: false, message: 'Story not found' },
          { status: 404 }
        );
      }

      // Check if slug is being changed and if new slug already exists
      if (slug) {
        const slugCheck = await client.query(
          'SELECT id FROM web_stories WHERE slug = $1 AND id != $2',
          [slug, storyId]
        );

        if (slugCheck.rows.length > 0) {
          return NextResponse.json(
            { success: false, message: 'A web story with this slug already exists' },
            { status: 400 }
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
      if (cover_image !== undefined) {
        updateFields.push(`cover_image = $${paramIndex++}`);
        updateValues.push(cover_image);
      }
      if (is_published !== undefined) {
        updateFields.push(`is_published = $${paramIndex++}`);
        updateValues.push(is_published);
      }
      if (creation_method !== undefined) {
        updateFields.push(`creation_method = $${paramIndex++}`);
        updateValues.push(creation_method);
      }
      if (content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        updateValues.push(content);
      }

      // Always update updated_at
      updateFields.push('updated_at = NOW()');

      if (updateFields.length === 1) {
        // Only updated_at would be updated, which is fine
        return NextResponse.json(
          { success: true, message: 'No changes to update', story: existingStory.rows[0] }
        );
      }

      // Add the WHERE clause parameter
      updateValues.push(storyId);

      const updateQuery = `
        UPDATE web_stories
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Story not found' },
          { status: 404 }
        );
      }

      console.log('[PUT /api/admin/web-stories/[id]] Story updated successfully:', result.rows[0].title);
      return NextResponse.json({
        success: true,
        message: 'Web story updated successfully',
        story: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PUT /api/admin/web-stories/[id]] Error updating story:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update web story',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/web-stories/[id] - Delete web story
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/web-stories/[id]] Starting delete request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/web-stories/[id]] Unauthorized - no session');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/web-stories/[id]] Forbidden - not admin');
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const storyId = parseInt(id);

    if (isNaN(storyId)) {
      console.log('[DELETE /api/admin/web-stories/[id]] Invalid story ID:', id);
      return NextResponse.json(
        { success: false, message: 'Invalid story ID' },
        { status: 400 }
      );
    }

    console.log('[DELETE /api/admin/web-stories/[id]] Parsed story ID:', storyId);
    console.log('[DELETE /api/admin/web-stories/[id]] Database config:', {
      host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST,
      port: serverRuntimeConfig.DB_PORT || process.env.DB_PORT,
      user: serverRuntimeConfig.DB_USER || process.env.DB_USER,
      database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME,
    });

    const client = await pool.connect();

    try {
      // Check if story exists
      console.log('[DELETE /api/admin/web-stories/[id]] Checking if story exists...');
      const existingStory = await client.query(
        'SELECT id, title FROM web_stories WHERE id = $1',
        [storyId]
      );

      console.log('[DELETE /api/admin/web-stories/[id]] Story check result:', existingStory.rows.length > 0 ? 'Found' : 'Not found');

      if (existingStory.rows.length === 0) {
        console.log('[DELETE /api/admin/web-stories/[id]] Story not found with ID:', storyId);
        return NextResponse.json(
          { success: false, message: 'Story not found' },
          { status: 404 }
        );
      }

      console.log('[DELETE /api/admin/web-stories/[id]] Deleting story:', existingStory.rows[0].title);

      // Delete story
      const result = await client.query(
        'DELETE FROM web_stories WHERE id = $1 RETURNING id, title',
        [storyId]
      );

      console.log('[DELETE /api/admin/web-stories/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

      if (result.rows.length === 0) {
        console.error('[DELETE /api/admin/web-stories/[id]] Delete query returned no rows');
        return NextResponse.json(
          { success: false, message: 'Failed to delete story' },
          { status: 500 }
        );
      }

      console.log('[DELETE /api/admin/web-stories/[id]] Story deleted successfully:', result.rows[0]);
      return NextResponse.json({
        success: true,
        message: 'Web story deleted successfully',
        deleted: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[DELETE /api/admin/web-stories/[id]] Error deleting story:', error);
    console.error('[DELETE /api/admin/web-stories/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete web story',
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

