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
  try {
    const slug = params.slug;
    
    if (!slug) {
      return new NextResponse(JSON.stringify({ error: 'Command slug is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Get the related commands from the database
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT related_commands FROM commands WHERE slug = $1',
        [slug]
      );
      
      if (result.rows.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'Command not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      return new NextResponse(JSON.stringify({ related_commands: result.rows[0].related_commands }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching related commands:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 