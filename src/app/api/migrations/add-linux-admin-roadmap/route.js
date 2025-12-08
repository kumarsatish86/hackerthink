import { NextResponse } from 'next/server';
import { auth } from '@/auth';


import { addLinuxAdminRoadmap } from '../add-linux-admin-roadmap';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await addLinuxAdminRoadmap();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running Linux Admin roadmap migration:', error);
    return NextResponse.json(
      { error: 'Failed to run migration' }, 
      { status: 500 }
    );
  }
} 
