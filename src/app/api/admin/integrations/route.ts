import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET all integrations
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM integrations ORDER BY provider, type
      `);
      
      return NextResponse.json({ integrations: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST to create a new integration
export async function POST(request: NextRequest) {
  try {
    const { 
      provider, type, name, status, config
    } = await request.json();
    
    if (!provider || !type || !name) {
      return NextResponse.json(
        { error: 'Provider, type, and name are required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Check if integration already exists
      const existCheck = await client.query(
        'SELECT id FROM integrations WHERE provider = $1 AND type = $2 AND name = $3',
        [provider, type, name]
      );
      
      if (existCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'This integration already exists' },
          { status: 409 }
        );
      }
      
      // Insert new integration
      const result = await client.query(`
        INSERT INTO integrations (
          provider, type, name, status, config
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        provider, type, name, status || false, config || {}
      ]);
      
      return NextResponse.json({ 
        message: 'Integration created successfully', 
        integration: result.rows[0] 
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
} 
