const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function checkColumnTypes() {
  const client = await pool.connect();
  
  try {
    console.log('Checking column types...');
    
    // Check lab_exercises author_id column
    const labExercisesColumn = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'lab_exercises' AND column_name = 'author_id'
    `);
    
    console.log('lab_exercises.author_id:', labExercisesColumn.rows);
    
    // Check users id column
    const usersColumn = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    
    console.log('users.id:', usersColumn.rows);
    
    // Check sample data
    const sampleUsers = await client.query('SELECT id, name FROM users LIMIT 3');
    console.log('Sample users:', sampleUsers.rows);
    
    const sampleExercises = await client.query('SELECT id, author_id FROM lab_exercises LIMIT 3');
    console.log('Sample exercises:', sampleExercises.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumnTypes();

