const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createInterviewTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating interview tables...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-interview-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the entire SQL file as one query
    // PostgreSQL can handle multiple statements separated by semicolons
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('Interview tables created successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating interview tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Export for use in other modules
module.exports = { createInterviewTables };

// Allow direct execution if run as a script
if (require.main === module) {
  createInterviewTables()
    .then(() => {
      console.log('Interview tables migration completed');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Interview tables migration failed:', error);
      pool.end();
      process.exit(1);
    });
}

