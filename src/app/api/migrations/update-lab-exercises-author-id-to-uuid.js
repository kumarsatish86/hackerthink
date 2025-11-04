const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function updateAuthorIdToUUID() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Updating lab_exercises.author_id to UUID type...');
    
    // First, clear any existing author_id values that are not valid UUIDs
    await client.query(`
      UPDATE lab_exercises 
      SET author_id = NULL 
      WHERE author_id IS NOT NULL 
      AND author_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    `);
    
    // Change the column type to UUID
    await client.query(`
      ALTER TABLE lab_exercises 
      ALTER COLUMN author_id TYPE UUID USING author_id::text::UUID
    `);
    
    console.log('Successfully updated author_id to UUID type');
    
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
updateAuthorIdToUUID()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

