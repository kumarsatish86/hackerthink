import { query } from '@/lib/db';

export async function createRoadmapModulesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS roadmap_modules (
      id SERIAL PRIMARY KEY,
      roadmap_id INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      duration VARCHAR(100),
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_roadmap_modules_roadmap_id ON roadmap_modules(roadmap_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Roadmap modules table created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating roadmap modules table:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const result = await createRoadmapModulesTable();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create roadmap modules table' });
  }
} 
