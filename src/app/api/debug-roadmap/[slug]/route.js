import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Debug endpoint to check roadmap and its modules
export async function GET(request, { params }) {
  try {
    const slug = params.slug;
    
    // Get the roadmap data
    const roadmapResult = await query(
      'SELECT * FROM roadmaps WHERE slug = $1',
      [slug]
    );
    
    if (roadmapResult.rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    const roadmap = roadmapResult.rows[0];
    
    // Get the modules for this roadmap
    const modulesResult = await query(
      'SELECT * FROM roadmap_modules WHERE roadmap_id = $1 ORDER BY position ASC',
      [roadmap.id]
    );
    
    // Get any resource data
    let resources = [];
    if (modulesResult.rows.length > 0) {
      const moduleIds = modulesResult.rows.map(m => m.id);
      const resourcesResult = await query(
        'SELECT * FROM roadmap_resources WHERE module_id = ANY($1)',
        [moduleIds]
      ).catch(err => {
        // If this fails, just log it - the table might not exist
        console.log('Error fetching resources:', err);
        return { rows: [] };
      });
      
      resources = resourcesResult.rows;
    }
    
    // Return detailed info for debugging
    return NextResponse.json({
      roadmap,
      modules: modulesResult.rows,
      resources,
      moduleCount: modulesResult.rows.length,
      hasModules: modulesResult.rows.length > 0,
      roadmapIsPublished: roadmap.is_published,
      tables: {
        roadmap: {
          structure: Object.keys(roadmap),
          values: roadmap
        },
        modules: modulesResult.rows.length > 0 ? {
          structure: Object.keys(modulesResult.rows[0] || {}),
          firstModule: modulesResult.rows[0]
        } : 'No modules found'
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Debug error', message: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
} 