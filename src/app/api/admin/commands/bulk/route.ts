import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, commandIds } = body;

    if (!action || !commandIds || !Array.isArray(commandIds) || commandIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      let result;
      const placeholders = commandIds.map((_, index) => `$${index + 1}`).join(',');

      switch (action) {
        case 'publish':
          result = await client.query(
            `UPDATE commands SET published = true, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            commandIds
          );
          break;

        case 'unpublish':
          result = await client.query(
            `UPDATE commands SET published = false, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            commandIds
          );
          break;

        case 'delete':
          result = await client.query(
            `DELETE FROM commands WHERE id IN (${placeholders})`,
            commandIds
          );
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ${action}ed ${result.rowCount} command${result.rowCount !== 1 ? 's' : ''}`,
        affectedRows: result.rowCount
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in bulk commands action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

