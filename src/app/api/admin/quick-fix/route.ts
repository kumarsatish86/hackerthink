import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Simple function to add all required columns
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add one column at a time to identify exactly which one might fail
      console.log('Adding category_id column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id INTEGER');
      
      console.log('Adding featured_image_alt column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT');
      
      console.log('Adding schedule_date column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS schedule_date TIMESTAMP WITH TIME ZONE');
      
      console.log('Adding tags column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT \'[]\'::jsonb');
      
      console.log('Adding seo_keywords column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT');
      
      console.log('Adding word_count column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_count INTEGER');
      
      console.log('Adding estimated_reading_time column...');
      await client.query('ALTER TABLE articles ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER');
      
      // Create categories table if it doesn't exist
      console.log('Creating categories table if needed...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          slug VARCHAR(255) UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add some default categories if the table is empty
      const { rows: categoryCount } = await client.query('SELECT COUNT(*) FROM categories');
      if (parseInt(categoryCount[0].count) === 0) {
        console.log('Adding default categories...');
        await client.query(`
          INSERT INTO categories (name, slug, description)
          VALUES 
            ('Linux', 'linux', 'Articles about Linux operating system'),
            ('DevOps', 'devops', 'DevOps culture, tools, and practices'),
            ('Programming', 'programming', 'Programming tutorials and guides'),
            ('Cloud', 'cloud', 'Cloud computing and services'),
            ('Security', 'security', 'System and network security')
        `);
      }
      
      // Check the structure of the articles table to confirm the columns exist
      const { rows: articleColumns } = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'articles'
        ORDER BY column_name
      `);
      
      // Check if categories table exists with proper columns
      const { rows: categoryColumns } = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'categories'
        ORDER BY column_name
      `);
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Database setup completed successfully',
        articleColumns: articleColumns.map(row => row.column_name),
        categoryColumns: categoryColumns.map(row => row.column_name),
        categoriesCreated: parseInt(categoryCount[0].count) === 0
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting up database:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      message: 'Error setting up database',
      error: String(error)
    }, { status: 500 });
  }
} 
