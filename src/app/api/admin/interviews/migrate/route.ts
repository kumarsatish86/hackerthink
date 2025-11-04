import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dynamically import the migration function
    const { createInterviewTables } = require('../../../migrations/create-interview-tables');
    
    // Run the migration
    await createInterviewTables();
    
    return NextResponse.json({
      message: 'Interview tables migration completed successfully',
      success: true
    });
  } catch (error: any) {
    console.error('Error running interview tables migration:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

