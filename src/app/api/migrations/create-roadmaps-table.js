import { query } from '@/lib/db';

export async function createRoadmapsTable() {
  // First, create the table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS roadmaps (
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_roadmaps_slug ON roadmaps(slug);
  `;

  try {
    // Create the base table
    await query(createTableQuery);
    console.log('Roadmaps table created or already exists');
    
    // Now add any missing columns that might not be in an existing table
    // This approach is safer for existing tables
    
    // Check if image_path column exists and add it if it doesn't
    const addImagePathColumn = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'roadmaps' AND column_name = 'image_path'
        ) THEN
          ALTER TABLE roadmaps ADD COLUMN image_path TEXT;
        END IF;
      END
      $$;
    `;
    
    await query(addImagePathColumn);
    console.log('Ensured image_path column exists');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating roadmaps table:', error);
    throw error;
  }
} 
