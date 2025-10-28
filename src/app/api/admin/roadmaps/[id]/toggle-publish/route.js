import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import roadmapService from '@/lib/services/roadmapService';

// Toggle roadmap publish status
export async function PUT(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Call the database service to toggle publish status
    const updatedRoadmap = await roadmapService.toggleRoadmapPublishStatus(id);
    
    if (!updatedRoadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedRoadmap);
  } catch (error) {
    console.error('Error toggling roadmap publish status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle roadmap publish status' }, 
      { status: 500 }
    );
  }
} 