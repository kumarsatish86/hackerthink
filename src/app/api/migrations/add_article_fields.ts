import { Pool } from 'pg';

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

    // Check if columns already exist
    const columnCheckResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      AND column_name IN ('featured_image', 'meta_title', 'meta_description', 'schema_json')
    `);
    
    const existingColumns = columnCheckResult.rows.map(row => row.column_name);
    
    // Add featured_image column if it doesn't exist
    if (!existingColumns.includes('featured_image')) {
      console.log('Adding featured_image column to articles table');
      await client.query(`
        ALTER TABLE articles 
        ADD COLUMN featured_image TEXT
      `);
    }
    
    // Add meta_title column if it doesn't exist
    if (!existingColumns.includes('meta_title')) {
      console.log('Adding meta_title column to articles table');
      await client.query(`
        ALTER TABLE articles 
        ADD COLUMN meta_title TEXT
      `);
    }
    
    // Add meta_description column if it doesn't exist
    if (!existingColumns.includes('meta_description')) {
      console.log('Adding meta_description column to articles table');
      await client.query(`
        ALTER TABLE articles 
        ADD COLUMN meta_description TEXT
      `);
    }
    
    // Add schema_json column if it doesn't exist
    if (!existingColumns.includes('schema_json')) {
      console.log('Adding schema_json column to articles table');
      await client.query(`
        ALTER TABLE articles 
        ADD COLUMN schema_json TEXT
      `);
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully');
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
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 
