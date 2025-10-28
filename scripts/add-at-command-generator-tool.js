const { Pool } = require('pg');

console.log('Script started...');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '5432');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_NAME:', process.env.DB_NAME || 'linuxconcept');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

console.log('Pool created with config:', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'ainews',
});

async function addAtCommandGeneratorTool() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  console.log('Connected to database successfully!');
  
  try {
    await client.query('BEGIN');
    console.log('Transaction started...');

    // Check if tool already exists
    const existingTool = await client.query(`
      SELECT id FROM tools WHERE slug = 'at-command-generator'
    `);
    console.log('Existing tool check result:', existingTool.rows);

    if (existingTool.rows.length > 0) {
      console.log('Tool already exists, updating...');
      
      await client.query(`
        UPDATE tools SET
          title = $1,
          description = $2,
          icon = $3,
          file_path = $4,
          published = $5,
          seo_title = $6,
          seo_description = $7,
          seo_keywords = $8,
          category = $9,
          platform = $10,
          license = $11,
          official_url = $12,
          popularity = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = 'at-command-generator'
      `, [
        'at Command Generator',
        'Generate precise at commands for Linux task scheduling. Schedule one-time tasks with our interactive command generator tool.',
        'clock',
        '/tools/at-command-generator', // Updated to use Next.js route
        true,
        'at Command Generator - Linux Task Scheduling Tool',
        'Generate at commands for Linux task scheduling. Schedule one-time tasks with our interactive at command generator tool.',
        'at command, linux scheduling, task scheduler, one-time tasks, linux tools, at daemon, job scheduling',
        'scheduling',
        'linux',
        'MIT',
        'https://ainews.com/tools/at-command-generator',
        8
      ]);
      
      console.log('Tool updated successfully!');
    } else {
      console.log('Adding new tool...');
      
      await client.query(`
        INSERT INTO tools (
          title, slug, description, icon, file_path, published,
          seo_title, seo_description, seo_keywords,
          category, platform, license, official_url, popularity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        'at Command Generator',
        'at-command-generator',
        'Generate precise at commands for Linux task scheduling. Schedule one-time tasks with our interactive command generator tool.',
        'clock',
        '/tools/at-command-generator', // Updated to use Next.js route
        true,
        'at Command Generator - Linux Task Scheduling Tool',
        'Generate at commands for Linux task scheduling. Schedule one-time tasks with our interactive at command generator tool.',
        'at command, linux scheduling, task scheduler, one-time tasks, linux tools, at daemon, job scheduling',
        'scheduling',
        'linux',
        'MIT',
        'https://ainews.com/tools/at-command-generator',
        8
      ]);
      
      console.log('Tool added successfully!');
    }

    await client.query('COMMIT');
    console.log('at Command Generator tool has been added/updated in the database!');
    
  } catch (error) {
    console.error('Error occurred:', error);
    await client.query('ROLLBACK');
    console.error('Error adding tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
console.log('Starting execution...');
addAtCommandGeneratorTool()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
