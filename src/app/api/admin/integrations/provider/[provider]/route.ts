import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureAssetStorageIntegration } from '@/lib/assetStorageSettings';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// GET integrations by provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  
  try {
    if (provider === 'other') {
      await ensureAssetStorageIntegration();
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM integrations WHERE provider = $1 ORDER BY type, name',
        [provider]
      );
      
      return NextResponse.json({ integrations: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching integrations for provider "${provider}":`, error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}