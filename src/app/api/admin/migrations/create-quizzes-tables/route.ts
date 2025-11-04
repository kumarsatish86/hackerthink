import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { createQuizzesTables } from '@/app/api/migrations/create-quizzes-tables';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Create quizzes tables
    await createQuizzesTables();
    
    return NextResponse.json({ 
      message: 'Quizzes tables created successfully',
      success: true
    });
  } catch (error) {
    console.error('Error creating quizzes tables:', error);
    return NextResponse.json(
      { message: 'Failed to create quizzes tables', error: String(error) },
      { status: 500 }
    );
  }
}

