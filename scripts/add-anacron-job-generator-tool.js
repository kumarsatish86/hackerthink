const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertAnacronJobGeneratorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Anacron Job Generator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['anacron-job-generator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: anacron-job-generator');
      return;
    }

    // Insert the new tool
    const insertResult = await client.query(
      `INSERT INTO tools (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, title, slug`,
      [
        'Anacron Job Generator (Daily/Weekly/Monthly)',
        'anacron-job-generator',
        'Generate anacron job configurations for daily, weekly, and monthly tasks. Create reliable scheduled jobs that run even when the system is offline, with support for both anacron and systemd timer alternatives.',
        'calendar-clock',
        '/tools/anacron-job-generator',
        true,
        'Anacron Job Generator - Daily/Weekly/Monthly Linux Task Scheduling',
        'Generate anacron job configurations for Linux task scheduling. Create daily, weekly, and monthly jobs that run reliably even when systems are offline. Includes systemd timer alternatives.',
        'anacron, job generator, linux scheduling, daily tasks, weekly tasks, monthly tasks, systemd timer, cron alternative, task automation, linux administration',
        new Date(),
        new Date()
      ]
    );

    if (insertResult.rows.length > 0) {
      const tool = insertResult.rows[0];
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${tool.id}`);
      console.log(`   Title: ${tool.title}`);
      console.log(`   Slug: ${tool.slug}`);
      console.log(`   File Path: /tools/anacron-job-generator`);
      console.log('   Published: true');
      console.log('   Icon: calendar-clock');
      console.log('   SEO Title: Anacron Job Generator - Daily/Weekly/Monthly Linux Task Scheduling');
      console.log('   SEO Description: Generate anacron job configurations for Linux task scheduling...');
      console.log('   SEO Keywords: anacron, job generator, linux scheduling, daily tasks, weekly tasks, monthly tasks, systemd timer, cron alternative, task automation, linux administration');
    } else {
      console.log('❌ Failed to add tool');
    }

  } catch (error) {
    console.error('❌ Error adding tool:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
insertAnacronJobGeneratorTool();
