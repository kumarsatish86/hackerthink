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

// GET /api/admin/roadmaps/[id] - Get single roadmap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET /api/admin/roadmaps/[id]] Starting fetch request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[GET /api/admin/roadmaps/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[GET /api/admin/roadmaps/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const roadmapId = parseInt(id);

    if (isNaN(roadmapId)) {
      console.log('[GET /api/admin/roadmaps/[id]] Invalid roadmap ID:', id);
      return NextResponse.json(
        { message: 'Invalid roadmap ID' },
        { status: 400 }
      );
    }

    console.log('[GET /api/admin/roadmaps/[id]] Parsed roadmap ID:', roadmapId);

    const client = await pool.connect();

    try {
      // Fetch roadmap
      const result = await client.query(
        `SELECT 
          id, title, slug, description, level, duration, 
          is_published, is_featured, meta_title, meta_description,
          image_path, seo_title, seo_description, seo_keywords,
          schema_json, prerequisites, career_outcomes, related_roadmaps,
          progress_tracking, created_at, updated_at
        FROM roadmaps
        WHERE id = $1`,
        [roadmapId]
      );

      if (result.rows.length === 0) {
        console.log('[GET /api/admin/roadmaps/[id]] Roadmap not found with ID:', roadmapId);
        return NextResponse.json(
          { message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      console.log('[GET /api/admin/roadmaps/[id]] Roadmap found:', result.rows[0].title);
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[GET /api/admin/roadmaps/[id]] Error fetching roadmap:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch roadmap',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/roadmaps/[id] - Update roadmap
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[PUT /api/admin/roadmaps/[id]] Starting update request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[PUT /api/admin/roadmaps/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[PUT /api/admin/roadmaps/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const roadmapId = parseInt(id);

    if (isNaN(roadmapId)) {
      console.log('[PUT /api/admin/roadmaps/[id]] Invalid roadmap ID:', id);
      return NextResponse.json(
        { message: 'Invalid roadmap ID' },
        { status: 400 }
      );
    }

    console.log('[PUT /api/admin/roadmaps/[id]] Parsed roadmap ID:', roadmapId);

    const data = await request.json();
    const client = await pool.connect();

    try {
      // Check if roadmap exists
      const existingRoadmap = await client.query(
        'SELECT id, title FROM roadmaps WHERE id = $1',
        [roadmapId]
      );

      if (existingRoadmap.rows.length === 0) {
        console.log('[PUT /api/admin/roadmaps/[id]] Roadmap not found with ID:', roadmapId);
        return NextResponse.json(
          { message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      // Check if slug is being changed and if new slug already exists
      if (data.slug) {
        const slugCheck = await client.query(
          'SELECT id FROM roadmaps WHERE slug = $1 AND id != $2',
          [data.slug, roadmapId]
        );

        if (slugCheck.rows.length > 0) {
          return NextResponse.json(
            { message: 'A roadmap with this slug already exists' },
            { status: 400 }
          );
        }
      }

      // Update roadmap
      const updateQuery = `
        UPDATE roadmaps
        SET 
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          level = COALESCE($4, level),
          duration = COALESCE($5, duration),
          is_published = COALESCE($6, is_published),
          is_featured = COALESCE($7, is_featured),
          meta_title = COALESCE($8, meta_title),
          meta_description = COALESCE($9, meta_description),
          image_path = COALESCE($10, image_path),
          seo_title = COALESCE($11, seo_title),
          seo_description = COALESCE($12, seo_description),
          seo_keywords = COALESCE($13, seo_keywords),
          schema_json = COALESCE($14, schema_json),
          prerequisites = COALESCE($15, prerequisites),
          career_outcomes = COALESCE($16, career_outcomes),
          related_roadmaps = COALESCE($17, related_roadmaps),
          progress_tracking = COALESCE($18, progress_tracking),
          updated_at = NOW()
        WHERE id = $19
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        data.title,
        data.slug,
        data.description,
        data.level,
        data.duration,
        data.is_published,
        data.is_featured,
        data.meta_title,
        data.meta_description,
        data.image_path,
        data.seo_title,
        data.seo_description,
        data.seo_keywords,
        data.schema_json,
        data.prerequisites ? JSON.stringify(data.prerequisites) : null,
        data.career_outcomes ? JSON.stringify(data.career_outcomes) : null,
        data.related_roadmaps ? JSON.stringify(data.related_roadmaps) : null,
        data.progress_tracking ? JSON.stringify(data.progress_tracking) : null,
        roadmapId
      ]);

      console.log('[PUT /api/admin/roadmaps/[id]] Roadmap updated successfully:', result.rows[0].title);
      return NextResponse.json({
        ...result.rows[0],
        message: 'Roadmap updated successfully'
      });
    } catch (error) {
      console.error('[PUT /api/admin/roadmaps/[id]] Error updating roadmap:', error);
      return NextResponse.json(
        {
          message: 'Failed to update roadmap',
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PUT /api/admin/roadmaps/[id]] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to update roadmap',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roadmaps/[id] - Delete roadmap
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/roadmaps/[id]] Starting delete request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/roadmaps/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/roadmaps/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const roadmapId = parseInt(id);

    if (isNaN(roadmapId)) {
      console.log('[DELETE /api/admin/roadmaps/[id]] Invalid roadmap ID:', id);
      return NextResponse.json(
        { message: 'Invalid roadmap ID' },
        { status: 400 }
      );
    }

    console.log('[DELETE /api/admin/roadmaps/[id]] Parsed roadmap ID:', roadmapId);
    console.log('[DELETE /api/admin/roadmaps/[id]] Database config:', {
      host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST,
      port: serverRuntimeConfig.DB_PORT || process.env.DB_PORT,
      user: serverRuntimeConfig.DB_USER || process.env.DB_USER,
      database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME,
    });

    const client = await pool.connect();

    try {
      // Check if roadmap exists
      console.log('[DELETE /api/admin/roadmaps/[id]] Checking if roadmap exists...');
      const existingRoadmap = await client.query(
        'SELECT id, title FROM roadmaps WHERE id = $1',
        [roadmapId]
      );

      console.log('[DELETE /api/admin/roadmaps/[id]] Roadmap check result:', existingRoadmap.rows.length > 0 ? 'Found' : 'Not found');

      if (existingRoadmap.rows.length === 0) {
        console.log('[DELETE /api/admin/roadmaps/[id]] Roadmap not found with ID:', roadmapId);
        return NextResponse.json(
          { message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      console.log('[DELETE /api/admin/roadmaps/[id]] Deleting roadmap:', existingRoadmap.rows[0].title);

      await client.query('BEGIN');

      // Delete related modules first (if CASCADE doesn't exist)
      // Note: If CASCADE is set, this will be redundant but harmless
      await client.query('DELETE FROM roadmap_modules WHERE roadmap_id = $1', [roadmapId]);

      // Delete roadmap
      const result = await client.query(
        'DELETE FROM roadmaps WHERE id = $1 RETURNING id, title',
        [roadmapId]
      );

      await client.query('COMMIT');

      console.log('[DELETE /api/admin/roadmaps/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

      if (result.rows.length === 0) {
        console.error('[DELETE /api/admin/roadmaps/[id]] Delete query returned no rows');
        return NextResponse.json(
          { message: 'Failed to delete roadmap' },
          { status: 500 }
        );
      }

      console.log('[DELETE /api/admin/roadmaps/[id]] Roadmap deleted successfully:', result.rows[0]);
      return NextResponse.json({
        message: 'Roadmap deleted successfully',
        deleted: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[DELETE /api/admin/roadmaps/[id]] Error deleting roadmap:', error);
      console.error('[DELETE /api/admin/roadmaps/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check for foreign key constraint errors
      if (error instanceof Error && error.message.includes('foreign key')) {
        return NextResponse.json(
          {
            message: 'Cannot delete roadmap: It has related data. Please delete related data first.',
            error: error.message
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: 'Failed to delete roadmap',
          error: error instanceof Error ? error.message : String(error),
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[DELETE /api/admin/roadmaps/[id]] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete roadmap',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

