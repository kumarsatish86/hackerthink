import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { published } = await request.json();

    // Check if interview exists
    const existingInterview = await pool.query(
      'SELECT id, status FROM interviews WHERE id = $1',
      [id]
    );

    if (existingInterview.rows.length === 0) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
    }

    const newStatus = published ? 'published' : 'draft';
    const publishDate = published ? 'CURRENT_TIMESTAMP' : null;

    // Update interview status
    const result = await pool.query(
      `UPDATE interviews
       SET status = $1,
           publish_date = CASE WHEN $2 THEN COALESCE(publish_date, CURRENT_TIMESTAMP) ELSE publish_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newStatus, published, id]
    );

    const updatedInterview = result.rows[0];

    // Format dates
    updatedInterview.created_at = updatedInterview.created_at ? new Date(updatedInterview.created_at).toISOString() : null;
    updatedInterview.updated_at = updatedInterview.updated_at ? new Date(updatedInterview.updated_at).toISOString() : null;
    updatedInterview.publish_date = updatedInterview.publish_date ? new Date(updatedInterview.publish_date).toISOString() : null;

    return NextResponse.json({
      message: `Interview ${published ? 'published' : 'unpublished'} successfully`,
      interview: updatedInterview
    });
  } catch (error) {
    console.error('Error updating interview status:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

