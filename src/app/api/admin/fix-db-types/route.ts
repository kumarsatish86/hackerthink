import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(request: NextRequest) {
  try {
    // Check types and structure
    const client = await pool.connect();
    try {
      // Check column types
      const { rows: tableInfo } = await client.query(`
        SELECT column_name, data_type, table_name
        FROM information_schema.columns 
        WHERE table_name IN ('articles', 'users') 
        AND column_name IN ('id', 'author_id')
        ORDER BY table_name, column_name
      `);
      
      // Ensure an article with ID 1 exists
      const { rows: articleCheck } = await client.query(`
        SELECT id FROM articles LIMIT 1
      `);

      // Create a dummy article if none exists
      if (articleCheck.length === 0) {
        await client.query(`
          INSERT INTO articles (title, slug, content, published)
          VALUES ('Test Article', 'test-article', 'This is a test article content.', false)
        `);
      }

      // Get first article ID for reference
      const { rows: firstArticle } = await client.query(`
        SELECT id FROM articles ORDER BY id LIMIT 1
      `);
      
      const firstArticleId = firstArticle.length > 0 ? firstArticle[0].id : null;

      return NextResponse.json({
        message: 'Database information retrieved',
        columnTypes: tableInfo,
        firstArticleId
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { message: 'Error checking database', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Fix the types and structure
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Update articles to ensure all author_id values are UUID format if possible
      console.log('Applying database fixes...');
      
      // 1a. First check if any author_id values exist that aren't valid UUIDs
      const { rows: invalidUUIDs } = await client.query(`
        SELECT id, author_id FROM articles 
        WHERE author_id IS NOT NULL 
        AND author_id != '' 
        AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);
      
      console.log(`Found ${invalidUUIDs.length} articles with non-UUID author_id values`);
      
      // 1b. For articles with invalid UUIDs, find a valid user or null the author_id
      const { rows: validUsers } = await client.query(`
        SELECT id FROM users LIMIT 1
      `);
      
      const defaultAuthorId = validUsers.length > 0 ? validUsers[0].id : null;
      
      if (invalidUUIDs.length > 0) {
        if (defaultAuthorId) {
          await client.query(`
            UPDATE articles 
            SET author_id = $1::text
            WHERE author_id IS NOT NULL 
            AND author_id != '' 
            AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          `, [defaultAuthorId]);
        } else {
          await client.query(`
            UPDATE articles 
            SET author_id = NULL
            WHERE author_id IS NOT NULL 
            AND author_id != '' 
            AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          `);
        }
      }
      
      // Ensure remaining NULL values are actually NULL, not empty strings
      await client.query(`
        UPDATE articles SET author_id = NULL WHERE author_id = ''
      `);
      
      // Check for any remaining issues
      const { rows: remainingIssues } = await client.query(`
        SELECT COUNT(*) as count FROM articles 
        WHERE author_id IS NOT NULL 
        AND author_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Database fixes applied successfully',
        details: {
          invalidUUIDsFixed: invalidUUIDs.length,
          defaultAuthorUsed: defaultAuthorId,
          remainingIssues: parseInt(remainingIssues[0].count)
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error fixing database:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fixing database:', error);
    return NextResponse.json(
      { message: 'Failed to fix database', error: String(error) },
      { status: 500 }
    );
  }
} 
