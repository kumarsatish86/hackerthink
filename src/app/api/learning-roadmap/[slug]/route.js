import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Get a specific roadmap by slug (public access)
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    console.log(`API: Fetching roadmap for slug: ${slug}`);
    
    // Get the roadmap directly from the database
    const roadmapResult = await query(
      'SELECT * FROM roadmaps WHERE slug = $1',
      [slug]
    );
    
    if (roadmapResult.rows.length === 0) {
      console.log(`API: Roadmap not found for slug: ${slug}`);
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    const roadmap = roadmapResult.rows[0];
    
    // For public access, only return published roadmaps
    if (!roadmap.is_published) {
      console.log(`API: Roadmap found but not published: ${slug}`);
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Get the modules for this roadmap
    const modulesResult = await query(
      'SELECT * FROM roadmap_modules WHERE roadmap_id = $1 ORDER BY position ASC',
      [roadmap.id]
    );
    
    const modules = modulesResult.rows;
    console.log(`API: Found ${modules.length} modules for roadmap: ${slug}`);
    
    // ADDED: Fetch resources for each module
    const moduleIds = modules.map(module => module.id);
    let resources = [];
    
    if (moduleIds.length > 0) {
      const resourcesResult = await query(
        'SELECT * FROM roadmap_resources WHERE module_id = ANY($1) ORDER BY position',
        [moduleIds]
      );
      resources = resourcesResult.rows;
      console.log(`API: Found ${resources.length} resources for modules`);
    }
    
    // Attach resources to their respective modules
    const modulesWithResources = modules.map(module => {
      const moduleResources = resources.filter(resource => resource.module_id === module.id);
      return {
        ...module,
        resources: moduleResources.length > 0 ? JSON.stringify(moduleResources) : null
      };
    });
    
    // Return the complete roadmap with modules and resources
    return NextResponse.json({
      ...roadmap,
      modules: modulesWithResources
    });
  } catch (error) {
    console.error('API Error fetching roadmap:', error);
    
    // If database connection fails, return 404 instead of 500
    // This allows the page to show "not found" instead of server error
    if (error.message && error.message.includes('password authentication failed')) {
      console.log('Database authentication failed, returning 404 for roadmap');
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch roadmap', message: error.message }, 
      { status: 500 }
    );
  }
} 