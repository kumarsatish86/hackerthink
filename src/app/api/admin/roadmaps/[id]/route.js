import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { validateRoadmapData } from '@/lib/validators/roadmapValidator';

// Get a specific roadmap by ID
export async function GET(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Use direct database query instead of going through roadmapService
    const result = await query('SELECT * FROM roadmaps WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap', message: error.message }, 
      { status: 500 }
    );
  }
}

// Update a roadmap by ID
export async function PUT(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const data = await request.json();
    
    // Validate roadmap data
    const validationResult = validateRoadmapData(data);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors }, 
        { status: 400 }
      );
    }
    
    // Update the roadmap in the database
    const updateResult = await query(
      `UPDATE roadmaps SET 
        title = $1, 
        slug = $2, 
        description = $3, 
        level = $4, 
        duration = $5, 
        meta_description = $6, 
        image_path = $7, 
        is_published = $8,
        seo_title = $9,
        seo_description = $10,
        seo_keywords = $11,
        schema_json = $12,
        prerequisites = $13,
        career_outcomes = $14,
        related_roadmaps = $15,
        progress_tracking = $16,
        updated_at = NOW()
      WHERE id = $17 RETURNING *`,
      [
        data.title,
        data.slug,
        data.description,
        data.level,
        data.duration,
        data.meta_description,
        data.image_path,
        data.is_published,
        data.seo_title,
        data.seo_description,
        data.seo_keywords,
        data.schema_json,
        data.prerequisites,
        data.career_outcomes,
        data.related_roadmaps,
        data.progress_tracking,
        id
      ]
    );
    
    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to update roadmap', message: error.message }, 
      { status: 500 }
    );
  }
}

// Delete a roadmap by ID
export async function DELETE(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Delete the roadmap from the database
    const deleteResult = await query('DELETE FROM roadmaps WHERE id = $1 RETURNING *', [id]);
    
    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json(deleteResult.rows[0]);
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to delete roadmap', message: error.message }, 
      { status: 500 }
    );
  }
} 