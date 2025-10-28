const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ainews',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addCommandRetryCronGeneratorTool() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check if tool already exists
    const checkQuery = 'SELECT id FROM tools WHERE slug = $1';
    const checkResult = await client.query(checkQuery, ['command-retry-cron-generator']);
    
    if (checkResult.rows.length > 0) {
      console.log('Tool already exists in database');
      return;
    }

    // Insert new tool
    const insertQuery = `
      INSERT INTO tools (
        title, 
        slug, 
        description, 
        icon, 
        file_path, 
        published, 
        seo_title, 
        seo_description, 
        seo_keywords, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      'Command Retry Cron Generator',
      'command-retry-cron-generator',
      'Create cron jobs with intelligent retry logic and exponential backoff for failed commands. Generate retry scripts, systemd timers, and cron entries with configurable retry strategies.',
      '🔄',
      'src/components/tools/CommandRetryCronGenerator.tsx',
      true,
      'Command Retry Cron Generator - Create Resilient Cron Jobs with Retry Logic',
      'Generate cron jobs with intelligent retry mechanisms, exponential backoff, and failure handling. Create resilient scheduling solutions for Linux systems.',
      'command retry cron generator, retry logic, exponential backoff, cron job retry, systemd timer retry, bash retry script, cron failure handling, job retry mechanism, linux scheduling, resilient cron jobs',
      new Date(),
      new Date()
    ];

    const result = await client.query(insertQuery, values);
    console.log('Command Retry Cron Generator tool added successfully with ID:', result.rows[0].id);

  } catch (error) {
    console.error('Error adding Command Retry Cron Generator tool:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

addCommandRetryCronGeneratorTool();
