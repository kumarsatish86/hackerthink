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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { action } = await request.json(); // 'publish' or 'unpublish'

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Use "publish" or "unpublish"' },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const existingQuiz = await pool.query('SELECT id, status FROM quizzes WHERE id = $1', [id]);
    if (existingQuiz.rows.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const newStatus = action === 'publish' ? 'published' : 'draft';

    // Update status
    const result = await pool.query(
      `UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );

    const updatedQuiz = result.rows[0];

    return NextResponse.json({
      message: `Quiz ${action}ed successfully`,
      quiz: {
        ...updatedQuiz,
        created_at: updatedQuiz.created_at ? new Date(updatedQuiz.created_at).toISOString() : null,
        updated_at: updatedQuiz.updated_at ? new Date(updatedQuiz.updated_at).toISOString() : null
      }
    });
  } catch (error) {
    console.error('Error updating quiz status:', error);
    return NextResponse.json(
      { message: 'Failed to update quiz status', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

