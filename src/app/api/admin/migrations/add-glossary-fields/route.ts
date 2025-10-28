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

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if the columns already exist
    const { rows: columns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'glossary_terms' 
      AND column_name = 'difficulty_level'
    `);

    // Skip if the columns already exist
    if (columns.length > 0) {
      return NextResponse.json({ 
        message: 'Glossary fields already exist. No changes made.',
        status: 'skipped'
      });
    }

    // Add the new columns
    await pool.query(`
      ALTER TABLE glossary_terms
      ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'Beginner',
      ADD COLUMN IF NOT EXISTS learning_path TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS knowledge_test TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS usage_examples TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS official_docs_url VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS video_tutorial_url VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS related_article_url VARCHAR(255) DEFAULT ''
    `);

    return NextResponse.json({ 
      message: 'Successfully added new glossary term fields',
      status: 'success'
    });
  } catch (error) {
    console.error('Error adding glossary fields:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
