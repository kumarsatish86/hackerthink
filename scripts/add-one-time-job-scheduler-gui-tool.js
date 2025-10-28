const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertOneTimeJobSchedulerGuiTool() {
  const client = await pool.connect();

  try {
    console.log('Adding One-Time Job Scheduler GUI Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['one-time-job-scheduler-gui']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: one-time-job-scheduler-gui');
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
        'One-Time Job Scheduler GUI',
        'one-time-job-scheduler-gui',
        'Schedule one-time jobs with a graphical interface. Generate commands for at, systemd timer, and cron scheduling methods. Perfect for maintenance tasks, backups, and system updates.',
        'calendar-clock',
        '/tools/one-time-job-scheduler-gui',
        true,
        'One-Time Job Scheduler GUI - Linux Task Scheduling Tool',
        'Schedule one-time Linux jobs with our graphical interface. Generate at commands, systemd timers, and cron jobs for precise task scheduling.',
        'one-time job scheduler, linux scheduling, at command, systemd timer, cron job, task automation, maintenance tasks, backup scheduling, linux administration',
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
      console.log(`   File Path: /tools/one-time-job-scheduler-gui`);
      console.log('   Published: true');
      console.log('   Icon: calendar-clock');
      console.log('   SEO Title: One-Time Job Scheduler GUI - Linux Task Scheduling Tool');
      console.log('   SEO Description: Schedule one-time Linux jobs with our graphical interface...');
      console.log('   SEO Keywords: one-time job scheduler, linux scheduling, at command, systemd timer, cron job, task automation, maintenance tasks, backup scheduling, linux administration');
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
insertOneTimeJobSchedulerGuiTool();
