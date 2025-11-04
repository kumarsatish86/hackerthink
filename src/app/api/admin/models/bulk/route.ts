import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// POST bulk operations
export async function POST(request: NextRequest) {
  try {
    const { action, ids } = await request.json();

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Action and IDs array are required' },
        { status: 400 }
      );
    }

    let query: string;
    let values: any[];
    let message: string;

    switch (action) {
      case 'delete':
        query = 'DELETE FROM ai_models WHERE id = ANY($1::uuid[]) RETURNING *';
        values = [ids];
        message = `${ids.length} model(s) deleted successfully`;
        break;

      case 'publish':
        query = 'UPDATE ai_models SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::uuid[]) RETURNING *';
        values = ['published', ids];
        message = `${ids.length} model(s) published successfully`;
        break;

      case 'unpublish':
        query = 'UPDATE ai_models SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::uuid[]) RETURNING *';
        values = ['draft', ids];
        message = `${ids.length} model(s) unpublished successfully`;
        break;

      case 'feature':
        query = 'UPDATE ai_models SET featured = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1::uuid[]) RETURNING *';
        values = [ids];
        message = `${ids.length} model(s) featured successfully`;
        break;

      case 'unfeature':
        query = 'UPDATE ai_models SET featured = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1::uuid[]) RETURNING *';
        values = [ids];
        message = `${ids.length} model(s) unfeatured successfully`;
        break;

      case 'archive':
        query = 'UPDATE ai_models SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::uuid[]) RETURNING *';
        values = ['archived', ids];
        message = `${ids.length} model(s) archived successfully`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await pool.query(query, values);

    return NextResponse.json({
      message,
      affected: result.rowCount,
      models: result.rows
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

