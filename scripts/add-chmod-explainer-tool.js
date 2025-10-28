const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting Chmod Explainer Tool insertion...');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '5432');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_NAME:', process.env.DB_NAME || 'linuxconcept');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertChmodExplainerTool() {
  console.log('Attempting to connect to database...');
  const client = await pool.connect();
  
  try {
    console.log('Connected to database successfully');
    
    // Check if the chmod explainer tool already exists
    console.log('Checking if tool already exists...');
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['chmod-explainer-tool']
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Chmod Explainer Tool already exists with ID:', checkResult.rows[0].id);
      return;
    }
    
    console.log('Tool does not exist, inserting...');
    
    // Insert the chmod explainer tool
    const insertResult = await client.query(
      `INSERT INTO tools 
       (title, slug, description, icon, file_path, published, seo_title, seo_description, seo_keywords, category, platform, license, popularity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id`,
      [
        'Chmod Explainer Tool',
        'chmod-explainer-tool',
        'Convert numeric chmod permissions (e.g., 755) to symbolic notation (e.g., rwxr-xr-x) and vice versa. Understand Linux file permissions with detailed explanations.',
        'file-lock',
        '/tools/chmod-explainer-tool',
        true,
        'Linux Chmod Explainer Tool - Convert Numeric to Symbolic Permissions',
        'Convert between numeric (755) and symbolic (rwxr-xr-x) chmod permissions. Learn Linux file permissions with detailed explanations and examples.',
        'chmod, linux, file permissions, numeric permissions, symbolic permissions, rwx, 755, 644, file access, linux security',
        'file-permissions',
        'linux',
        'MIT',
        85
      ]
    );
    
    console.log('✅ Chmod Explainer Tool created successfully with ID:', insertResult.rows[0].id);
    console.log('Tool details:');
    console.log('- Title: Chmod Explainer Tool');
    console.log('- Slug: chmod-explainer-tool');
    console.log('- Description: Convert numeric chmod permissions to symbolic notation');
    console.log('- Category: file-permissions');
    console.log('- Platform: linux');
    console.log('- Published: true');
    
  } catch (err) {
    console.error('❌ Error inserting Chmod Explainer Tool:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
  } finally {
    console.log('Releasing client connection...');
    client.release();
    console.log('Closing pool...');
    await pool.end();
    console.log('Script completed');
  }
}

// Run the function
console.log('Calling insertChmodExplainerTool...');
insertChmodExplainerTool().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});
