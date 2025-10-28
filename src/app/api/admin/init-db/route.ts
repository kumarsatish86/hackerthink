import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// @ts-ignore - Import the correct function
const { initializeDatabase } = require('../../migrations/db-schema');

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Initialize database
    await initializeDatabase();

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      success: true
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
