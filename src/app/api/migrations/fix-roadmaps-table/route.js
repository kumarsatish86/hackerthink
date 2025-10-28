import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if the roadmaps table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'roadmaps'
      ) as table_exists;
    `;
    
    const tableCheckResult = await query(tableCheckQuery);
    const tableExists = tableCheckResult.rows[0].table_exists;
    
    if (!tableExists) {
      // If table doesn't exist, create it with all needed columns
      const createTableQuery = `
        CREATE TABLE roadmaps (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          level VARCHAR(50),
          difficulty VARCHAR(50),
          duration INTEGER,
          is_published BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          meta_title VARCHAR(255),
          meta_description TEXT,
          image_path TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_roadmaps_slug ON roadmaps(slug);
      `;
      
      await query(createTableQuery);
      return NextResponse.json({ message: 'Roadmaps table created with all columns' });
    }
    
    // If the table exists, check and add any missing columns
    
    // Check for image_path column
    const columnCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'roadmaps' AND column_name = 'image_path'
      ) as column_exists;
    `;
    
    const columnCheckResult = await query(columnCheckQuery);
    const imagePathColumnExists = columnCheckResult.rows[0].column_exists;
    
    if (!imagePathColumnExists) {
      // Add the image_path column if it doesn't exist
      await query('ALTER TABLE roadmaps ADD COLUMN image_path TEXT;');
    }
    
    return NextResponse.json({ 
      message: 'Roadmaps table check complete',
      details: {
        tableExists,
        imagePathColumnExists,
        fixesApplied: !imagePathColumnExists
      }
    });
    
  } catch (error) {
    console.error('Error fixing roadmaps table:', error);
    return NextResponse.json(
      { error: 'Failed to fix roadmaps table', message: error.message }, 
      { status: 500 }
    );
  }
} 
