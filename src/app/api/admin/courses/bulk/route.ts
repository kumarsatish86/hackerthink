import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { transaction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, courseIds } = await request.json();

    if (!action || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      let queryResult;
      
      switch (action) {
        case 'publish':
          queryResult = await client.query(
            'UPDATE courses SET published = true, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)',
            [courseIds]
          );
          break;
          
        case 'unpublish':
          queryResult = await client.query(
            'UPDATE courses SET published = false, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)',
            [courseIds]
          );
          break;
          
        case 'delete':
          queryResult = await client.query(
            'DELETE FROM courses WHERE id = ANY($1)',
            [courseIds]
          );
          break;
          
        default:
          throw new Error('Invalid action');
      }

      return queryResult;
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ${action}ed ${result.rowCount} course(s)` 
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

