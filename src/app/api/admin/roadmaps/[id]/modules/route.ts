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

// GET /api/admin/roadmaps/[id]/modules - Get all modules for a roadmap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET /api/admin/roadmaps/[id]/modules] Starting fetch request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[GET /api/admin/roadmaps/[id]/modules] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[GET /api/admin/roadmaps/[id]/modules] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const roadmapId = parseInt(id);

    if (isNaN(roadmapId)) {
      console.log('[GET /api/admin/roadmaps/[id]/modules] Invalid roadmap ID:', id);
      return NextResponse.json(
        { message: 'Invalid roadmap ID' },
        { status: 400 }
      );
    }

    console.log('[GET /api/admin/roadmaps/[id]/modules] Parsed roadmap ID:', roadmapId);

    const client = await pool.connect();

    try {
      // Check if roadmap exists
      const roadmapCheck = await client.query(
        'SELECT id FROM roadmaps WHERE id = $1',
        [roadmapId]
      );

      if (roadmapCheck.rows.length === 0) {
        console.log('[GET /api/admin/roadmaps/[id]/modules] Roadmap not found with ID:', roadmapId);
        return NextResponse.json(
          { message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      // Fetch modules for this roadmap
      // Note: The column might be 'position' or 'order_index' depending on schema
      const result = await client.query(
        `SELECT 
          id, roadmap_id, title, description, level, duration,
          COALESCE(position, order_index, 0) as position,
          skills, resources, created_at, updated_at
        FROM roadmap_modules
        WHERE roadmap_id = $1
        ORDER BY COALESCE(position, order_index, 0) ASC`,
        [roadmapId]
      );

      console.log('[GET /api/admin/roadmaps/[id]/modules] Found', result.rows.length, 'modules');
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[GET /api/admin/roadmaps/[id]/modules] Error fetching modules:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch modules',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/roadmaps/[id]/modules - Create a new module for a roadmap
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[POST /api/admin/roadmaps/[id]/modules] Starting create request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[POST /api/admin/roadmaps/[id]/modules] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[POST /api/admin/roadmaps/[id]/modules] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const roadmapId = parseInt(id);

    if (isNaN(roadmapId)) {
      console.log('[POST /api/admin/roadmaps/[id]/modules] Invalid roadmap ID:', id);
      return NextResponse.json(
        { message: 'Invalid roadmap ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const client = await pool.connect();

    try {
      // Check if roadmap exists
      const roadmapCheck = await client.query(
        'SELECT id FROM roadmaps WHERE id = $1',
        [roadmapId]
      );

      if (roadmapCheck.rows.length === 0) {
        console.log('[POST /api/admin/roadmaps/[id]/modules] Roadmap not found with ID:', roadmapId);
        return NextResponse.json(
          { message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      // Insert new module
      // Handle both 'position' and 'order_index' column names
      const insertQuery = `
        INSERT INTO roadmap_modules (
          roadmap_id, title, description, level, duration,
          position, order_index, skills, resources
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        roadmapId,
        data.title,
        data.description || null,
        data.level || null,
        data.duration || null,
        data.position !== undefined ? data.position : data.order_index !== undefined ? data.order_index : 0,
        data.skills || null,
        data.resources ? JSON.stringify(data.resources) : null
      ]);

      console.log('[POST /api/admin/roadmaps/[id]/modules] Module created successfully:', result.rows[0].title);
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
      console.error('[POST /api/admin/roadmaps/[id]/modules] Error creating module:', error);
      return NextResponse.json(
        {
          message: 'Failed to create module',
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[POST /api/admin/roadmaps/[id]/modules] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to create module',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

