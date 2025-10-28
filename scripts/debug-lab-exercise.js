

const { Pool } = require('pg');

// Create a pool connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function main() {
  try {
    console.log('Checking lab exercise with slug: shell-scripting-basics');
    
    // Check if the exercise exists and get its basic details
    const basicResult = await pool.query(
      `SELECT id, title, slug, published FROM lab_exercises WHERE slug = $1`,
      ['shell-scripting-basics']
    );
    
    if (basicResult.rows.length === 0) {
      console.log('No lab exercise found with slug: shell-scripting-basics');
    } else {
      console.log('Basic details:');
      console.log(basicResult.rows[0]);
      
      // Get all fields for this exercise
      const detailResult = await pool.query(
        `SELECT * FROM lab_exercises WHERE slug = $1`,
        ['shell-scripting-basics']
      );
      
      console.log('\nFull details:');
      const exercise = detailResult.rows[0];
      
      // Log each column separately to avoid console truncation
      for (const [key, value] of Object.entries(exercise)) {
        if (typeof value === 'string' && value.length > 100) {
          console.log(`${key}: ${value.substring(0, 100)}... (truncated)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Check for null or empty required fields
      const requiredFields = ['title', 'content', 'instructions'];
      const missingFields = requiredFields.filter(field => 
        !exercise[field] || exercise[field].trim() === ''
      );
      
      if (missingFields.length > 0) {
        console.log('\nWarning: Missing required fields:', missingFields.join(', '));
      }
    }
  } catch (error) {
    console.error('Error checking lab exercise:', error);
  } finally {
    await pool.end();
  }
}

main(); 