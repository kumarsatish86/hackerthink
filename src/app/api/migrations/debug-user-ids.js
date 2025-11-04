const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function debugUserIds() {
  const client = await pool.connect();
  
  try {
    console.log('Checking user IDs...');
    
    // Get sample users
    const users = await client.query('SELECT id, name, email FROM users LIMIT 5');
    console.log('Sample users:');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id} (type: ${typeof user.id}), Name: ${user.name}`);
    });
    
    // Check lab exercises
    const exercises = await client.query('SELECT id, author_id FROM lab_exercises LIMIT 3');
    console.log('\nSample lab exercises:');
    exercises.rows.forEach(exercise => {
      console.log(`ID: ${exercise.id}, Author ID: ${exercise.author_id} (type: ${typeof exercise.author_id})`);
    });
    
    // Check column types
    const userColumnType = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    
    const exerciseColumnType = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'lab_exercises' AND column_name = 'author_id'
    `);
    
    console.log('\nColumn types:');
    console.log(`users.id: ${userColumnType.rows[0]?.data_type}`);
    console.log(`lab_exercises.author_id: ${exerciseColumnType.rows[0]?.data_type}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

debugUserIds();

