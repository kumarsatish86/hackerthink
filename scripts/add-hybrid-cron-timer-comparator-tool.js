const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertHybridCronTimerComparatorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Hybrid Cron+Timer Comparator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['hybrid-cron-timer-comparator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: hybrid-cron-timer-comparator');
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
        category,
        platform,
        license,
        official_url,
        popularity,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id, title, slug`,
      [
        'Hybrid Cron+Timer Comparator Tool',
        'hybrid-cron-timer-comparator',
        'Compare traditional cron scheduling with modern systemd timers and get hybrid recommendations. Analyze your requirements to determine the best scheduling approach or combination of both methods for optimal task execution.',
        '⚖️',
        '/tools/hybrid-cron-timer-comparator',
        true,
        'Hybrid Cron+Timer Comparator - Choose the Best Linux Scheduling Method',
        'Compare cron vs systemd timer approaches and get hybrid recommendations. Analyze your requirements to determine the optimal scheduling strategy for Linux task automation.',
        'hybrid cron timer comparator, cron vs systemd timer, linux scheduling comparison, hybrid scheduling approach, cron job scheduling, systemd timer generator, linux automation, task scheduling tool, cron alternative, systemd vs cron',
        'scheduling',
        'linux',
        'MIT',
        '#',
        85,
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
      console.log(`   File Path: /tools/hybrid-cron-timer-comparator`);
      console.log('   Published: true');
      console.log('   Icon: ⚖️');
      console.log('   Category: scheduling');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 85');
      console.log('   SEO Title: Hybrid Cron+Timer Comparator - Choose the Best Linux Scheduling Method');
      console.log('   SEO Description: Compare cron vs systemd timer approaches and get hybrid recommendations...');
      console.log('   SEO Keywords: hybrid cron timer comparator, cron vs systemd timer, linux scheduling comparison...');
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
insertHybridCronTimerComparatorTool();
