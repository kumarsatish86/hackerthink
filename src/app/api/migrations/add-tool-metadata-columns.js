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

    // Check if the columns already exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tools' 
      AND column_name IN ('category', 'platform', 'license', 'official_url', 'popularity');
    `);

    const existingColumns = columnCheck.rows.map(row => row.column_name);
    
    // Add missing columns
    if (!existingColumns.includes('category')) {
      console.log('Adding category column...');
      await client.query(`
        ALTER TABLE tools 
        ADD COLUMN category VARCHAR(50) DEFAULT 'misc';
      `);
    }
    
    if (!existingColumns.includes('platform')) {
      console.log('Adding platform column...');
      await client.query(`
        ALTER TABLE tools 
        ADD COLUMN platform VARCHAR(50) DEFAULT 'linux';
      `);
    }
    
    if (!existingColumns.includes('license')) {
      console.log('Adding license column...');
      await client.query(`
        ALTER TABLE tools 
        ADD COLUMN license VARCHAR(50) DEFAULT 'MIT';
      `);
    }
    
    if (!existingColumns.includes('official_url')) {
      console.log('Adding official_url column...');
      await client.query(`
        ALTER TABLE tools 
        ADD COLUMN official_url VARCHAR(255);
      `);
    }
    
    if (!existingColumns.includes('popularity')) {
      console.log('Adding popularity column...');
      await client.query(`
        ALTER TABLE tools 
        ADD COLUMN popularity INTEGER DEFAULT 5;
      `);
    }
    
    // Update existing tools with default values
    console.log('Updating existing tools with default metadata...');
    await client.query(`
      UPDATE tools
      SET 
        category = CASE 
          WHEN slug LIKE '%permission%' OR slug LIKE '%chmod%' OR slug LIKE '%chown%' THEN 'permissions'
          WHEN slug LIKE '%cron%' THEN 'scheduling'
          ELSE 'misc'
        END,
        platform = 'linux',
        license = 'MIT',
        official_url = CONCAT('https://ainews.com/tools/', slug),
        popularity = 5
      WHERE (category IS NULL OR platform IS NULL OR license IS NULL OR official_url IS NULL OR popularity IS NULL);
    `);

    await client.query('COMMIT');
    console.log('Tools table migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the migration
runMigration()
  .then(() => {
    console.log('Tools table metadata columns migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Tools table metadata columns migration failed:', error);
    process.exit(1);
  }); 
