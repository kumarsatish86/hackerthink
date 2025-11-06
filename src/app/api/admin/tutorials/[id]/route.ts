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

// Helper function to detect if ID is UUID or INTEGER
function parseTutorialId(id: string): string | number {
  // Check if it's a UUID (contains hyphens and is 36 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id; // Return as string for UUID
  }
  // Try to parse as integer
  const parsed = parseInt(id, 10);
  if (!isNaN(parsed)) {
    return parsed;
  }
  // If neither, return as string (let database handle validation)
  return id;
}

// GET /api/admin/tutorials/[id] - Get single tutorial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET /api/admin/tutorials/[id]] Starting fetch request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[GET /api/admin/tutorials/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[GET /api/admin/tutorials/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const tutorialId = parseTutorialId(id);

    console.log('[GET /api/admin/tutorials/[id]] Parsed tutorial ID:', tutorialId, typeof tutorialId);

    const client = await pool.connect();

    try {
      // Fetch tutorial with category information
      const result = await client.query(
        `SELECT 
          t.*,
          tc.name as category_name,
          tc.slug as category_slug
        FROM tutorials t
        LEFT JOIN tutorial_categories tc ON t.category_id = tc.id
        WHERE t.id = $1`,
        [tutorialId]
      );

      if (result.rows.length === 0) {
        console.log('[GET /api/admin/tutorials/[id]] Tutorial not found with ID:', tutorialId);
        return NextResponse.json(
          { message: 'Tutorial not found' },
          { status: 404 }
        );
      }

      console.log('[GET /api/admin/tutorials/[id]] Tutorial found:', result.rows[0].title);
      return NextResponse.json({
        tutorial: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[GET /api/admin/tutorials/[id]] Error fetching tutorial:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch tutorial',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tutorials/[id] - Update tutorial
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[PUT /api/admin/tutorials/[id]] Starting update request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[PUT /api/admin/tutorials/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[PUT /api/admin/tutorials/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const tutorialId = parseTutorialId(id);

    console.log('[PUT /api/admin/tutorials/[id]] Parsed tutorial ID:', tutorialId, typeof tutorialId);

    const data = await request.json();
    const {
      title,
      slug,
      description,
      icon,
      order_index,
      is_active,
      category_id
    } = data;

    const client = await pool.connect();

    try {
      // Check if tutorial exists
      const existingTutorial = await client.query(
        'SELECT id, title FROM tutorials WHERE id = $1',
        [tutorialId]
      );

      if (existingTutorial.rows.length === 0) {
        console.log('[PUT /api/admin/tutorials/[id]] Tutorial not found with ID:', tutorialId);
        return NextResponse.json(
          { message: 'Tutorial not found' },
          { status: 404 }
        );
      }

      // Check if slug is being changed and if new slug already exists
      if (slug) {
        const slugCheck = await client.query(
          'SELECT id FROM tutorials WHERE slug = $1 AND id != $2',
          [slug, tutorialId]
        );

        if (slugCheck.rows.length > 0) {
          return NextResponse.json(
            { message: 'A tutorial with this slug already exists' },
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
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(description);
      }
      if (icon !== undefined) {
        updateFields.push(`icon = $${paramIndex++}`);
        updateValues.push(icon);
      }
      if (order_index !== undefined) {
        updateFields.push(`order_index = $${paramIndex++}`);
        updateValues.push(order_index);
      }
      if (is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(is_active);
      }
      if (category_id !== undefined) {
        updateFields.push(`category_id = $${paramIndex++}`);
        updateValues.push(category_id);
      }

      // Always update updated_at
      updateFields.push('updated_at = NOW()');

      if (updateFields.length === 1) {
        // Only updated_at would be updated, which is fine
        return NextResponse.json({
          tutorial: existingTutorial.rows[0],
          message: 'No changes to update'
        });
      }

      // Add the WHERE clause parameter
      updateValues.push(tutorialId);

      const updateQuery = `
        UPDATE tutorials
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: 'Tutorial not found' },
          { status: 404 }
        );
      }

      console.log('[PUT /api/admin/tutorials/[id]] Tutorial updated successfully:', result.rows[0].title);
      return NextResponse.json({
        tutorial: result.rows[0],
        message: 'Tutorial updated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PUT /api/admin/tutorials/[id]] Error updating tutorial:', error);
    return NextResponse.json(
      {
        message: 'Failed to update tutorial',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tutorials/[id] - Delete tutorial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/tutorials/[id]] Starting delete request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/tutorials/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/tutorials/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const tutorialId = parseTutorialId(id);

    console.log('[DELETE /api/admin/tutorials/[id]] Parsed tutorial ID:', tutorialId, typeof tutorialId);
    console.log('[DELETE /api/admin/tutorials/[id]] Database config:', {
      host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST,
      port: serverRuntimeConfig.DB_PORT || process.env.DB_PORT,
      user: serverRuntimeConfig.DB_USER || process.env.DB_USER,
      database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME,
    });

    const client = await pool.connect();

    try {
      // Check if tutorial exists
      console.log('[DELETE /api/admin/tutorials/[id]] Checking if tutorial exists...');
      const existingTutorial = await client.query(
        'SELECT id, title FROM tutorials WHERE id = $1',
        [tutorialId]
      );

      console.log('[DELETE /api/admin/tutorials/[id]] Tutorial check result:', existingTutorial.rows.length > 0 ? 'Found' : 'Not found');

      if (existingTutorial.rows.length === 0) {
        console.log('[DELETE /api/admin/tutorials/[id]] Tutorial not found with ID:', tutorialId);
        return NextResponse.json(
          { message: 'Tutorial not found' },
          { status: 404 }
        );
      }

      console.log('[DELETE /api/admin/tutorials/[id]] Deleting tutorial:', existingTutorial.rows[0].title);

      // Delete related sections and lessons first (if cascade doesn't exist)
      // Check if there are sections
      const sectionsCheck = await client.query(
        'SELECT id FROM tutorial_sections WHERE tutorial_id = $1',
        [tutorialId]
      );

      if (sectionsCheck.rows.length > 0) {
        console.log(`[DELETE /api/admin/tutorials/[id]] Found ${sectionsCheck.rows.length} sections, deleting lessons first...`);
        
        // Delete lessons for all sections
        for (const section of sectionsCheck.rows) {
          await client.query(
            'DELETE FROM tutorial_lessons WHERE section_id = $1',
            [section.id]
          );
        }

        // Delete sections
        await client.query(
          'DELETE FROM tutorial_sections WHERE tutorial_id = $1',
          [tutorialId]
        );
      }

      // Delete tutorial
      const result = await client.query(
        'DELETE FROM tutorials WHERE id = $1 RETURNING id, title',
        [tutorialId]
      );

      console.log('[DELETE /api/admin/tutorials/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

      if (result.rows.length === 0) {
        console.error('[DELETE /api/admin/tutorials/[id]] Delete query returned no rows');
        return NextResponse.json(
          { message: 'Failed to delete tutorial' },
          { status: 500 }
        );
      }

      console.log('[DELETE /api/admin/tutorials/[id]] Tutorial deleted successfully:', result.rows[0]);
      return NextResponse.json({
        message: 'Tutorial deleted successfully',
        deleted: result.rows[0]
      });
    } catch (error) {
      console.error('[DELETE /api/admin/tutorials/[id]] Error deleting tutorial:', error);
      console.error('[DELETE /api/admin/tutorials/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check for foreign key constraint errors
      if (error instanceof Error && error.message.includes('foreign key')) {
        return NextResponse.json(
          {
            message: 'Cannot delete tutorial: It has related sections or lessons. Please delete them first.',
            error: error.message
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: 'Failed to delete tutorial',
          error: error instanceof Error ? error.message : String(error),
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[DELETE /api/admin/tutorials/[id]] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete tutorial',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

