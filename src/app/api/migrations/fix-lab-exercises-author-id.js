const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function fixAuthorIdColumn() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Checking current column types...');
    
    // Check the current column type
    const columnInfo = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'lab_exercises' AND column_name = 'author_id'
    `);
    
    console.log('Current author_id column info:', columnInfo.rows);
    
    // Check if users table uses UUID or INTEGER
    const usersColumnInfo = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    
    console.log('Users id column info:', usersColumnInfo.rows);
    
    // Check some sample data
    const sampleUsers = await client.query('SELECT id, name FROM users LIMIT 3');
    console.log('Sample user IDs:', sampleUsers.rows);
    
    const sampleExercises = await client.query('SELECT id, author_id FROM lab_exercises LIMIT 3');
    console.log('Sample exercise author_ids:', sampleExercises.rows);
    
    // If users table uses UUID and lab_exercises uses INTEGER, we need to fix this
    if (usersColumnInfo.rows[0]?.data_type === 'uuid' && columnInfo.rows[0]?.data_type === 'integer') {
      console.log('Converting author_id from INTEGER to UUID...');
      
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
      
      console.log('Successfully converted author_id to UUID type');
    } else if (usersColumnInfo.rows[0]?.data_type === 'integer' && columnInfo.rows[0]?.data_type === 'integer') {
      console.log('Both tables use INTEGER, no conversion needed');
    } else {
      console.log('Column types are compatible, no changes needed');
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
fixAuthorIdColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

