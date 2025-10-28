const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function updateChmodToolPath() {
  const client = await pool.connect();
  
  try {
    console.log('Updating Chmod Explainer Tool file_path...');
    
    // Update the file_path for the chmod explainer tool
    const updateResult = await client.query(
      `UPDATE tools 
       SET file_path = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE slug = $2 
       RETURNING id, title, file_path`,
      ['/tools/chmod-explainer-tool.html', 'chmod-explainer-tool']
    );
    
    if (updateResult.rows.length > 0) {
      const tool = updateResult.rows[0];
      console.log('✅ Tool updated successfully!');
      console.log(`   ID: ${tool.id}`);
      console.log(`   Title: ${tool.title}`);
      console.log(`   New file_path: ${tool.file_path}`);
    } else {
      console.log('❌ Tool not found with slug: chmod-explainer-tool');
    }
    
  } catch (error) {
    console.error('❌ Error updating tool:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
updateChmodToolPath();
