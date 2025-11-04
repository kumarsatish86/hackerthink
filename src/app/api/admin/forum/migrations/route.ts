import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { createForumTables } from '@/app/api/migrations/create-forum-tables';
import { extendUsersForForum } from '@/app/api/migrations/extend-users-for-forum';

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

    const results: any[] = [];

    // Run forum tables migration
    try {
      console.log('Starting createForumTables migration...');
      const result = await createForumTables();
      console.log('createForumTables completed:', result);
      results.push({
        migration: 'create-forum-tables',
        status: 'success',
        message: 'Forum tables created successfully'
      });
    } catch (error: any) {
      console.error('Error creating forum tables:', error);
      console.error('Error stack:', error.stack);
      results.push({
        migration: 'create-forum-tables',
        status: 'error',
        message: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    // Run extend users migration
    try {
      console.log('Starting extendUsersForForum migration...');
      const result = await extendUsersForForum();
      console.log('extendUsersForForum completed:', result);
      results.push({
        migration: 'extend-users-for-forum',
        status: 'success',
        message: 'Users table extended successfully'
      });
    } catch (error: any) {
      console.error('Error extending users table:', error);
      console.error('Error stack:', error.stack);
      results.push({
        migration: 'extend-users-for-forum',
        status: 'error',
        message: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    const allSuccess = results.every(r => r.status === 'success');

    return NextResponse.json({
      message: allSuccess ? 'Forum migrations completed successfully' : 'Forum migrations completed with errors',
      results
    }, { status: allSuccess ? 200 : 207 });
  } catch (error: any) {
    console.error('Error running forum migrations:', error);
    return NextResponse.json(
      { message: 'Failed to run forum migrations', error: String(error) },
      { status: 500 }
    );
  }
}

