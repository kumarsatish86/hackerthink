import { NextResponse } from 'next/server';
import { auth } from '@/auth';


import { createRoadmapModulesTable } from '../create-roadmap-modules-table';
import { createRoadmapResourcesTable } from '../create-roadmap-resources-table';
import { createRoadmapsTable } from '../create-roadmaps-table';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run migrations
    const results = [];
    
    try {
      // Create roadmaps table first (parent table)
      await createRoadmapsTable();
      results.push({
        table: 'roadmaps',
        status: 'success'
      });
    } catch (error) {
      console.error('Error creating roadmaps table:', error);
      results.push({
        table: 'roadmaps',
        status: 'error',
        message: error.message
      });
    }
    
    try {
      // Create roadmap modules table
      await createRoadmapModulesTable();
      results.push({
        table: 'roadmap_modules',
        status: 'success'
      });
    } catch (error) {
      console.error('Error creating roadmap_modules table:', error);
      results.push({
        table: 'roadmap_modules',
        status: 'error',
        message: error.message
      });
    }
    
    try {
      // Create roadmap resources table
      await createRoadmapResourcesTable();
      results.push({
        table: 'roadmap_resources',
        status: 'success'
      });
    } catch (error) {
      console.error('Error creating roadmap_resources table:', error);
      results.push({
        table: 'roadmap_resources',
        status: 'error',
        message: error.message
      });
    }

    return NextResponse.json({
      message: 'Migrations completed',
      results
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json(
      { error: 'Failed to run migrations' },
      { status: 500 }
    );
  }
} 
