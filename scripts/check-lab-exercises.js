const { Pool } = require('pg');

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function checkLabExercises() {
  const client = await pool.connect();
  try {
    console.log('Checking lab_exercises table...');
    
    // First, check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_exercises'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Error: lab_exercises table does not exist!');
      return;
    }
    
    // Get count of exercises
    const countResult = await client.query('SELECT COUNT(*) FROM lab_exercises');
    const count = parseInt(countResult.rows[0].count);
    console.log(`Found ${count} lab exercises in the database`);
    
    if (count === 0) {
      console.log('No exercises found. Consider running the migration script to add sample exercises.');
      return;
    }
    
    // Get all exercises
    const { rows } = await client.query(`
      SELECT id, title, slug, difficulty, duration, published 
      FROM lab_exercises 
      ORDER BY id
    `);
    
    console.log('\nExercises in the database:');
    console.table(rows);
    
    // Check published state
    const publishedCount = rows.filter(ex => ex.published).length;
    console.log(`Published exercises: ${publishedCount}/${count}`);
    
    if (publishedCount === 0) {
      console.log('\nWarning: No published exercises found. The API only returns published exercises.');
      console.log('Update the database to set published=true for exercises you want to display.');
    }
    
  } catch (error) {
    console.error('Error checking lab exercises:', error);
  } finally {
    client.release();
    // Close the pool
    pool.end();
  }
}

// Run the check
checkLabExercises()
  .then(() => console.log('Check completed'))
  .catch(err => console.error('Error during check:', err)); 