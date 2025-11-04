import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { action, quiz_ids } = await request.json();

    if (!action || !Array.isArray(quiz_ids) || quiz_ids.length === 0) {
      return NextResponse.json(
        { message: 'Action and quiz_ids array are required' },
        { status: 400 }
      );
    }

    if (!['publish', 'unpublish', 'delete', 'archive'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Use "publish", "unpublish", "delete", or "archive"' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let updatedCount = 0;

      if (action === 'delete') {
        // Delete quizzes (cascade will handle related records)
        const result = await client.query(
          `DELETE FROM quizzes WHERE id = ANY($1::int[]) RETURNING id`,
          [quiz_ids]
        );
        updatedCount = result.rowCount || 0;
      } else {
        // Update status
        let newStatus: string;
        if (action === 'publish') {
          newStatus = 'published';
        } else if (action === 'unpublish') {
          newStatus = 'draft';
        } else if (action === 'archive') {
          newStatus = 'archived';
        } else {
          throw new Error('Invalid action');
        }

        const result = await client.query(
          `UPDATE quizzes 
           SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ANY($2::int[])
           RETURNING id`,
          [newStatus, quiz_ids]
        );
        updatedCount = result.rowCount || 0;
      }

      await client.query('COMMIT');
      client.release();

      return NextResponse.json({
        message: `Successfully ${action}ed ${updatedCount} quiz(es)`,
        updated_count: updatedCount
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { message: 'Failed to perform bulk action', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

