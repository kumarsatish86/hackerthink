import { query } from '@/lib/db';

export async function createRoadmapResourcesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS roadmap_resources (
      id SERIAL PRIMARY KEY,
      module_id INTEGER NOT NULL REFERENCES roadmap_modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      url VARCHAR(255),
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_roadmap_resources_module_id ON roadmap_resources(module_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Roadmap resources table created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating roadmap resources table:', error);
    throw error;
  }
} 
