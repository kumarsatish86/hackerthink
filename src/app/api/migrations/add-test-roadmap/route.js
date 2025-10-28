import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if the roadmap already exists
    const existingRoadmap = await query(
      'SELECT id FROM roadmaps WHERE slug = $1',
      ['test-roadmap']
    );

    if (existingRoadmap.rows.length > 0) {
      // Roadmap already exists
      return NextResponse.json({ 
        message: 'Test roadmap already exists',
        id: existingRoadmap.rows[0].id
      });
    }

    // Create the test roadmap
    const roadmapResult = await query(
      `INSERT INTO roadmaps 
        (title, slug, description, level, duration, is_published, meta_description, image_path)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        'Test Roadmap',
        'test-roadmap',
        'This is a test roadmap for demonstration purposes',
        'beginner',
        '1-2 weeks',
        true,
        'Test roadmap meta description',
        '/images/roadmaps/test-roadmap.jpg'
      ]
    );
    
    const roadmapId = roadmapResult.rows[0].id;
    
    // Add some modules to the roadmap
    await query(
      `INSERT INTO roadmap_modules
        (roadmap_id, title, description, position, duration)
      VALUES
        ($1, $2, $3, $4, $5)`,
      [
        roadmapId,
        'Getting Started',
        'Introduction to the test roadmap',
        1,
        '1-2 days'
      ]
    );
    
    await query(
      `INSERT INTO roadmap_modules
        (roadmap_id, title, description, position, duration)
      VALUES
        ($1, $2, $3, $4, $5)`,
      [
        roadmapId,
        'Advanced Concepts',
        'More advanced test concepts',
        2,
        '3-5 days'
      ]
    );
    
    return NextResponse.json({ 
      message: 'Test roadmap created successfully',
      id: roadmapId
    });
    
  } catch (error) {
    console.error('Error creating test roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to create test roadmap', message: error.message }, 
      { status: 500 }
    );
  }
} 
