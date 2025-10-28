import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { addLinuxAdminRoadmap } from '../add-linux-admin-roadmap';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
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
