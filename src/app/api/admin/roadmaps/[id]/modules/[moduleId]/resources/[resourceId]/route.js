import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

// Get a specific resource
export async function GET(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;
    const resourceId = params.resourceId;

    // Check if module exists and belongs to the roadmap
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Get the resource
    const resourceResult = await query(
      'SELECT * FROM roadmap_resources WHERE id = $1 AND module_id = $2',
      [resourceId, moduleId]
    );

    if (resourceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resourceResult.rows[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// Update a specific resource
export async function PUT(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;
    const resourceId = params.resourceId;
    const data = await request.json();

    // Check if module exists and belongs to the roadmap
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if resource exists and belongs to the module
    const resourceCheckResult = await query(
      'SELECT id FROM roadmap_resources WHERE id = $1 AND module_id = $2',
      [resourceId, moduleId]
    );

    if (resourceCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: 'Resource title is required' },
        { status: 400 }
      );
    }

    if (!data.type) {
      return NextResponse.json(
        { error: 'Resource type is required' },
        { status: 400 }
      );
    }

    // Update the resource
    const updateQuery = `
      UPDATE roadmap_resources SET
        title = $1,
        type = $2,
        url = $3,
        description = $4,
        position = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND module_id = $7
      RETURNING *
    `;

    const values = [
      data.title,
      data.type,
      data.url || null,
      data.description || null,
      data.position || 0,
      resourceId,
      moduleId
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// Delete a specific resource
export async function DELETE(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;
    const resourceId = params.resourceId;

    // Check if module exists and belongs to the roadmap
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if resource exists and belongs to the module
    const resourceCheckResult = await query(
      'SELECT id FROM roadmap_resources WHERE id = $1 AND module_id = $2',
      [resourceId, moduleId]
    );

    if (resourceCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete the resource
    const deleteQuery = `
      DELETE FROM roadmap_resources 
      WHERE id = $1 AND module_id = $2
      RETURNING *
    `;

    const result = await query(deleteQuery, [resourceId, moduleId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // After deleting, reorder remaining resources to keep positions consecutive
    await query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_position
        FROM roadmap_resources 
        WHERE module_id = $1
      )
      UPDATE roadmap_resources rr
      SET position = r.new_position
      FROM ranked r
      WHERE rr.id = r.id AND rr.module_id = $1
    `, [moduleId]);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
} 