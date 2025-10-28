import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { validateRoadmapModuleData } from '@/lib/validators/roadmapValidator';

// Get a specific module
export async function GET(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;

    // Get the module
    const moduleResult = await query(
      'SELECT * FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Get resources for this module
    const resourcesResult = await query(
      'SELECT * FROM roadmap_resources WHERE module_id = $1 ORDER BY position ASC',
      [moduleId]
    );

    // Combine module with its resources
    const moduleWithResources = {
      ...moduleResult.rows[0],
      resources: resourcesResult.rows
    };

    return NextResponse.json(moduleWithResources);
  } catch (error) {
    console.error('Error fetching roadmap module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap module' },
      { status: 500 }
    );
  }
}

// Update a specific module
export async function PUT(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;
    const data = await request.json();
    
    // Add the roadmap_id to the data
    data.roadmap_id = parseInt(roadmapId, 10);
    
    // For position-only updates, we can skip full validation
    const isPositionOnlyUpdate = Object.keys(data).length === 2 && 
                               'roadmap_id' in data && 
                               'position' in data;
    
    if (!isPositionOnlyUpdate) {
      // Validate module data
      const validationResult = validateRoadmapModuleData(data);
      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        );
      }
    }

    // Check if module exists
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Update the module
    let updateQuery;
    let values;
    
    if (isPositionOnlyUpdate) {
      // Only update position (for reordering)
      updateQuery = `
        UPDATE roadmap_modules SET
          position = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND roadmap_id = $3
        RETURNING *
      `;
      
      values = [
        data.position,
        moduleId,
        roadmapId
      ];
    } else {
      // Full update
      updateQuery = `
        UPDATE roadmap_modules SET
          title = $1,
          description = $2,
          position = $3,
          duration = $4,
          skills = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND roadmap_id = $7
        RETURNING *
      `;
      
      values = [
        data.title,
        data.description || null,
        data.position || 0,
        data.duration || null,
        data.skills || null,
        moduleId,
        roadmapId
      ];
    }

    const result = await query(updateQuery, values);
    
    // Get resources for this module
    const resourcesResult = await query(
      'SELECT * FROM roadmap_resources WHERE module_id = $1 ORDER BY position ASC',
      [moduleId]
    );
    
    // Return updated module with resources
    return NextResponse.json({
      ...result.rows[0],
      resources: resourcesResult.rows
    });
  } catch (error) {
    console.error('Error updating roadmap module:', error);
    return NextResponse.json(
      { error: 'Failed to update roadmap module' },
      { status: 500 }
    );
  }
}

// Delete a specific module
export async function DELETE(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;

    // Check if module exists and belongs to the roadmap
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Delete the module (resources will be deleted automatically due to ON DELETE CASCADE)
    const deleteQuery = `
      DELETE FROM roadmap_modules 
      WHERE id = $1 AND roadmap_id = $2
      RETURNING *
    `;

    const result = await query(deleteQuery, [moduleId, roadmapId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    
    // After deleting, reorder remaining modules to keep positions consecutive
    await query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_position
        FROM roadmap_modules 
        WHERE roadmap_id = $1
      )
      UPDATE roadmap_modules rm
      SET position = r.new_position
      FROM ranked r
      WHERE rm.id = r.id AND rm.roadmap_id = $1
    `, [roadmapId]);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting roadmap module:', error);
    return NextResponse.json(
      { error: 'Failed to delete roadmap module' },
      { status: 500 }
    );
  }
} 