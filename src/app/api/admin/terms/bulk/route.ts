import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function ensurePublishedColumn(client: { query: typeof pool.query }) {
  await client.query(`
    ALTER TABLE glossary_terms
    ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true
  `);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, termIds } = body;

    if (!action || !termIds || !Array.isArray(termIds) || termIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const ids = termIds
      .map((id: string | number) => parseInt(String(id), 10))
      .filter((id: number) => !Number.isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid term IDs provided' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
      let result;

      switch (action) {
        case 'publish':
          await ensurePublishedColumn(client);
          result = await client.query(
            `UPDATE glossary_terms
             SET published = true, updated_at = CURRENT_TIMESTAMP
             WHERE id IN (${placeholders})`,
            ids
          );
          break;

        case 'unpublish':
          await ensurePublishedColumn(client);
          result = await client.query(
            `UPDATE glossary_terms
             SET published = false, updated_at = CURRENT_TIMESTAMP
             WHERE id IN (${placeholders})`,
            ids
          );
          break;

        case 'delete':
          result = await client.query(
            `DELETE FROM glossary_terms WHERE id IN (${placeholders})`,
            ids
          );
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ${action}ed ${result.rowCount} term${result.rowCount !== 1 ? 's' : ''}`,
        affectedRows: result.rowCount,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in bulk terms action:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
