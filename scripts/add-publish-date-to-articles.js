const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addPublishDateColumns() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Adding publish_date, update_date, and schedule_date columns to articles table...');

    // Add publish_date column
    await client.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE
    `);
    console.log('✓ Added publish_date column');

    // Add update_date column
    await client.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS update_date TIMESTAMP WITH TIME ZONE
    `);
    console.log('✓ Added update_date column');

    // Add schedule_date column (might already exist from previous migration)
    await client.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS schedule_date TIMESTAMP WITH TIME ZONE
    `);
    console.log('✓ Added schedule_date column');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_update_date ON articles(update_date)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_schedule_date ON articles(schedule_date)
    `);
    console.log('✓ Created indexes');

    await client.query('COMMIT');
    console.log('\n=== Migration completed successfully ===\n');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding columns:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPublishDateColumns().catch(console.error);

