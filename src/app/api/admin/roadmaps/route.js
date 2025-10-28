import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { validateRoadmapData } from '@/lib/validators/roadmapValidator';

// Get all roadmaps for admin
export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';
    
    // Directly query the database instead of using roadmapService
    let queryText = 'SELECT * FROM roadmaps';
    if (publishedOnly) {
      queryText += ' WHERE is_published = true';
    }
    queryText += ' ORDER BY updated_at DESC';
    
    const result = await query(queryText);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' }, 
      { status: 500 }
    );
  }
}

// Create a new roadmap
export async function POST(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate roadmap data
    const validationResult = validateRoadmapData(data);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors }, 
        { status: 400 }
      );
    }

    // Log the data we're trying to insert
    console.log('Creating roadmap with data:', data);

    // Check if image_path column exists
    const columnCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'roadmaps' AND column_name = 'image_path'
      ) as column_exists;
    `;
    
    const columnCheckResult = await query(columnCheckQuery);
    const imagePathColumnExists = columnCheckResult.rows[0].column_exists;
    
    let queryText;
    let values;
    
    // Always include all columns now
    queryText = `
      INSERT INTO roadmaps 
        (title, slug, description, level, duration, is_published, meta_description, image_path,
         seo_title, seo_description, seo_keywords, schema_json,
         prerequisites, career_outcomes, related_roadmaps, progress_tracking)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    values = [
      data.title,
      data.slug,
      data.description || null,
      data.level || null,
      data.duration || null,
      data.is_published || false,
      data.meta_description || null,
      data.image_path || null,
      data.seo_title || null,
      data.seo_description || null,
      data.seo_keywords || null,
      data.schema_json || null,
      data.prerequisites || null,
      data.career_outcomes || null,
      data.related_roadmaps || null,
      data.progress_tracking || null
    ];
    
    const result = await query(queryText, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    // Return more detailed error message for debugging
    return NextResponse.json(
      { error: 'Failed to create roadmap', message: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
} 
