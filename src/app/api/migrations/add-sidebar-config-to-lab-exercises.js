const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add sidebar configuration fields to lab_exercises table
    console.log('Adding sidebar configuration fields to lab_exercises table...');
    
    // Add helpful_resources JSON field
    await client.query(`
      ALTER TABLE lab_exercises 
      ADD COLUMN IF NOT EXISTS helpful_resources JSONB DEFAULT '[]'::jsonb
    `);
    
    // Add terminal_simulation JSON field
    await client.query(`
      ALTER TABLE lab_exercises 
      ADD COLUMN IF NOT EXISTS terminal_simulation JSONB DEFAULT '{}'::jsonb
    `);
    
    // Add related_exercises JSON field
    await client.query(`
      ALTER TABLE lab_exercises 
      ADD COLUMN IF NOT EXISTS related_exercises JSONB DEFAULT '[]'::jsonb
    `);
    
    // Add sidebar_settings JSON field for general sidebar configuration
    await client.query(`
      ALTER TABLE lab_exercises 
      ADD COLUMN IF NOT EXISTS sidebar_settings JSONB DEFAULT '{}'::jsonb
    `);
    
    await client.query('COMMIT');
    console.log('Sidebar configuration fields added successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the migration
runMigration()
  .then(() => {
    console.log('Sidebar configuration migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sidebar configuration migration failed:', error);
    process.exit(1);
  });

