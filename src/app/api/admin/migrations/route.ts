import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { migrationWrapper } from '../../migrations/migration-wrapper';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin (add additional role check if your app has roles)
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Use migration wrapper to prevent build-time execution
    await migrationWrapper.runMigrations();
    
    return NextResponse.json({ 
      message: 'Migrations executed successfully' 
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json(
      { message: 'Failed to run migrations', error: String(error) },
      { status: 500 }
    );
  }
} 
