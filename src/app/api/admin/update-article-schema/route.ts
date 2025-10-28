import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Add new columns to articles table
      console.log('Adding columns to articles table...');
      await client.query(`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id INTEGER;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS schedule_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_count INTEGER;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER;
      `);

      // 2. Check and fix types
      console.log('Checking database types...');
      const { rows: tableInfo } = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name IN ('id', 'author_id')
      `);
      console.log('Articles table column types:', tableInfo);
      
      const { rows: userInfo } = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
      `);
      console.log('Users table id type:', userInfo);

      // 3. Create categories table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          slug VARCHAR(255) UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Insert default categories
      await client.query(`
        INSERT INTO categories (name, slug, description)
        VALUES 
          ('Linux', 'linux', 'Articles about Linux operating system'),
          ('DevOps', 'devops', 'DevOps culture, tools, and practices'),
          ('Programming', 'programming', 'Programming tutorials and guides'),
          ('Cloud', 'cloud', 'Cloud computing and services'),
          ('Security', 'security', 'System and network security')
        ON CONFLICT (name) DO NOTHING;
      `);

      await client.query('COMMIT');
      return NextResponse.json({ 
        message: 'Article schema updated successfully',
        details: {
          columns_added: [
            'featured_image_alt', 
            'category_id', 
            'schedule_date', 
            'tags', 
            'seo_keywords',
            'word_count',
            'estimated_reading_time'
          ],
          tables_created: ['categories'],
          default_categories_added: 5
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating article schema:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating article schema:', error);
    return NextResponse.json(
      { message: 'Failed to update article schema', error: String(error) },
      { status: 500 }
    );
  }
} 
