import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  // Get slug from params
  const slug = params.slug;
  
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM commands WHERE slug = $1 AND published = true',
        [slug]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Command not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching command with slug ${slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch command' },
      { status: 500 }
    );
  }
} 