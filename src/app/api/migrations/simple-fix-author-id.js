const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function fixAuthorId() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration...');
    
    // First, let's see what we have
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lab_exercises' AND column_name = 'author_id'
    `);
    
    console.log('Current author_id type:', result.rows);
    
    // Check if we have any data
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM lab_exercises');
    console.log('Total lab exercises:', dataCheck.rows[0].count);
    
    // Try to change the column type
    try {
      await client.query(`
        ALTER TABLE lab_exercises 
        ALTER COLUMN author_id TYPE TEXT
      `);
      console.log('Changed author_id to TEXT');
    } catch (err) {
      console.log('Error changing to TEXT:', err.message);
    }
    
    // Now try to change to UUID
    try {
      await client.query(`
        ALTER TABLE lab_exercises 
        ALTER COLUMN author_id TYPE UUID USING author_id::UUID
      `);
      console.log('Changed author_id to UUID');
    } catch (err) {
      console.log('Error changing to UUID:', err.message);
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAuthorId();

