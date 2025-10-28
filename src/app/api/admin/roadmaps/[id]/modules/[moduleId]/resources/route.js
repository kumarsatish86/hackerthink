import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

// Get all resources for a specific module
export async function GET(request, { params }) {
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

    // Get all resources for the module, ordered by position
    const resourcesResult = await query(
      'SELECT * FROM roadmap_resources WHERE module_id = $1 ORDER BY position ASC',
      [moduleId]
    );

    return NextResponse.json(resourcesResult.rows);
  } catch (error) {
    console.error('Error fetching module resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module resources' },
      { status: 500 }
    );
  }
}

// Create a new resource for a module
export async function POST(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const moduleId = params.moduleId;
    const data = await request.json();
    
    // Check if module exists and belongs to the roadmap
    const moduleCheckResult = await query(
      'SELECT id FROM roadmap_modules WHERE id = $1 AND roadmap_id = $2',
      [moduleId, roadmapId]
    );

    if (moduleCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
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

    // Get the highest position value to place the new resource at the end
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) as max_position FROM roadmap_resources WHERE module_id = $1',
      [moduleId]
    );
    
    const position = parseInt(positionResult.rows[0].max_position) + 1;

    // Insert the resource
    const insertQuery = `
      INSERT INTO roadmap_resources 
        (module_id, title, type, url, description, position)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      moduleId,
      data.title,
      data.type,
      data.url || null,
      data.description || null,
      data.position || position
    ];

    const result = await query(insertQuery, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating module resource:', error);
    return NextResponse.json(
      { error: 'Failed to create module resource' },
      { status: 500 }
    );
  }
} 