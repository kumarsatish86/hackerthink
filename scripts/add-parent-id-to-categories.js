const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Starting migration: Adding parent_id columns to category tables...');
    
    // Add parent_id column to news_categories table
    console.log('Adding parent_id column to news_categories table...');
    await client.query(`
      ALTER TABLE news_categories 
      ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES news_categories(id) ON DELETE SET NULL
    `);
    console.log('✓ Added parent_id column to news_categories');
    
    // Add parent_id column to tutorial_categories table (id is UUID type)
    console.log('Adding parent_id column to tutorial_categories table...');
    await client.query(`
      ALTER TABLE tutorial_categories 
      ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tutorial_categories(id) ON DELETE SET NULL
    `);
    console.log('✓ Added parent_id column to tutorial_categories');
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_news_categories_parent_id ON news_categories(parent_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tutorial_categories_parent_id ON tutorial_categories(parent_id)
    `);
    console.log('✓ Created indexes');
    
    await client.query('COMMIT');
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

