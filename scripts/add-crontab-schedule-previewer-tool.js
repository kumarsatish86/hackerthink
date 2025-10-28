const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertCrontabSchedulePreviewerTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Crontab Schedule Previewer Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['crontab-schedule-previewer']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: crontab-schedule-previewer');
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
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, title, slug`,
      [
        'Crontab Schedule Previewer (next 5 runs)',
        'crontab-schedule-previewer',
        'A comprehensive Linux tool to preview cron schedules and see the next 5 scheduled runs. Plan maintenance windows, coordinate team schedules, and ensure timely task execution with precise scheduling information and timezone support.',
        'clock',
        '/tools/crontab-schedule-previewer',
        true,
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
      console.log(`   File Path: /tools/crontab-schedule-previewer`);
      console.log('   Published: true');
      console.log('   Icon: clock');
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
insertCrontabSchedulePreviewerTool();
