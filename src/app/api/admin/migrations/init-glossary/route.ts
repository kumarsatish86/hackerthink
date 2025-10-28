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

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'glossary_terms'
        )
      `);
      
      const tableExists = tableCheck.rows[0].exists;
      let message = '';
      
      if (!tableExists) {
        // Create the table if it doesn't exist
        await client.query(`
          CREATE TABLE glossary_terms (
            id SERIAL PRIMARY KEY,
            term VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            definition TEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            difficulty_level VARCHAR(50) DEFAULT 'Beginner',
            learning_path TEXT DEFAULT '',
            knowledge_test TEXT DEFAULT '',
            usage_examples TEXT DEFAULT '',
            official_docs_url VARCHAR(255) DEFAULT '',
            video_tutorial_url VARCHAR(255) DEFAULT '',
            related_article_url VARCHAR(255) DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        message = 'Glossary terms table created successfully';
      } else {
        // Check for any missing columns and add them if needed
        const requiredColumns = [
          'difficulty_level', 'learning_path', 'knowledge_test', 
          'usage_examples', 'official_docs_url', 'video_tutorial_url', 
          'related_article_url'
        ];
        
        for (const column of requiredColumns) {
          const columnCheck = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'glossary_terms' AND column_name = $1
            )
          `, [column]);
          
          if (!columnCheck.rows[0].exists) {
            // Add the missing column with an appropriate default value
            let dataType = 'TEXT';
            let defaultValue = "''";
            
            if (column === 'difficulty_level') {
              dataType = 'VARCHAR(50)';
              defaultValue = "'Beginner'";
            } else if (column.endsWith('_url')) {
              dataType = 'VARCHAR(255)';
            }
            
            await client.query(`
              ALTER TABLE glossary_terms
              ADD COLUMN ${column} ${dataType} DEFAULT ${defaultValue}
            `);
          }
        }
        message = 'Glossary terms table updated with all required columns';
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        message,
        status: 'success'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing glossary table:', error);
    return NextResponse.json(
      { message: 'Failed to initialize glossary table', error: String(error) },
      { status: 500 }
    );
  }
} 
