import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = await pool.connect();
    
    try {
      // Fetch the tool by slug
      const result = await client.query(
        `SELECT * FROM tools WHERE slug = $1 AND published = true`,
        [slug]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ tool: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching tool with slug "${slug}":`, error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
} 