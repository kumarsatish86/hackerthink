import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function POST() {
  try {
    // Check for admin session
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if the schema_json column exists
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'schema_json'
    `);
    
    let result;
    
    // Add the column if it doesn't exist
    if (columnInfo.length === 0) {
      // Add the schema_json column to the articles table
      const { rowCount } = await pool.query(`
        ALTER TABLE articles 
        ADD COLUMN schema_json TEXT
      `);
      
      result = {
        message: 'Migration successful',
        action: 'schema_json column added to articles table',
        rowsAffected: rowCount
      };
    } else {
      result = {
        message: 'No migration needed',
        reason: 'schema_json column already exists'
      };
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { message: 'Migration failed', error: String(error) },
      { status: 500 }
    );
  }
} 
