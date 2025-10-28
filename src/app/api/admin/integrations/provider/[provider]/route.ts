import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET integrations by provider
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  
  try {
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