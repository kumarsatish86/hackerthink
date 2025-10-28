import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET() {
  try {
    // Check if the schema_json column exists in the articles table
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `);
    
    // Check for an article with schema_json
    const { rows: sampleArticles } = await pool.query(`
      SELECT id, title, schema_json
      FROM articles
      LIMIT 5
    `);
    
    return NextResponse.json({
      columns: columnInfo,
      sampleArticles
    });
  } catch (error) {
    console.error('Database diagnostic error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
