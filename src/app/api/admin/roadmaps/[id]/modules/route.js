import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { validateRoadmapModuleData } from '@/lib/validators/roadmapValidator';

// Get all modules for a specific roadmap
export async function GET(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;

    // Check if roadmap exists
    const roadmapCheckResult = await query(
      'SELECT id FROM roadmaps WHERE id = $1',
      [roadmapId]
    );

    if (roadmapCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    // Get all modules for the roadmap, ordered by position
    const modulesResult = await query(
      'SELECT * FROM roadmap_modules WHERE roadmap_id = $1 ORDER BY position ASC',
      [roadmapId]
    );

    // For each module, get its resources
    const modulesWithResources = await Promise.all(
      modulesResult.rows.map(async (module) => {
        const resourcesResult = await query(
          'SELECT * FROM roadmap_resources WHERE module_id = $1 ORDER BY position ASC',
          [module.id]
        );
        
        return {
          ...module,
          resources: resourcesResult.rows
        };
      })
    );

    return NextResponse.json(modulesWithResources);
  } catch (error) {
    console.error('Error fetching roadmap modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap modules' },
      { status: 500 }
    );
  }
}

// Create a new module for a roadmap
export async function POST(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;
    const data = await request.json();
    
    // Add the roadmap_id to the data
    data.roadmap_id = parseInt(roadmapId, 10);
    
    // Validate module data
    const validationResult = validateRoadmapModuleData(data);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Check if roadmap exists
    const roadmapCheckResult = await query(
      'SELECT id FROM roadmaps WHERE id = $1',
      [roadmapId]
    );

    if (roadmapCheckResult.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    // Insert the module
    const insertQuery = `
      INSERT INTO roadmap_modules 
        (roadmap_id, title, description, position, duration, skills)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.roadmap_id,
      data.title,
      data.description || null,
      data.position || 0,
      data.duration || null,
      data.skills || null
    ];

    const result = await query(insertQuery, values);
    
    // Return the newly created module
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap module:', error);
    return NextResponse.json(
      { error: 'Failed to create roadmap module' },
      { status: 500 }
    );
  }
} 