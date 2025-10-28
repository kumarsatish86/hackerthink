const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertContainerizedCronJobGeneratorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Containerized Cron Job Generator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['containerized-cron-job-generator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: containerized-cron-job-generator');
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
        'Generate Cron Jobs for Containerized Apps',
        'containerized-cron-job-generator',
        'Create cron jobs specifically designed for containerized environments. Generate Kubernetes CronJob manifests, Docker-based cron solutions, and containerized scheduling configurations with proper resource limits, volume mounts, and environment variables.',
        '🐳',
        '/tools/containerized-cron-job-generator',
        true,
        'Containerized Cron Job Generator - Kubernetes & Docker Scheduling',
        'Generate cron jobs for containerized applications. Create Kubernetes CronJob manifests, Docker cron solutions, and containerized scheduling with proper resource management and volume configuration.',
        'containerized cron job generator, kubernetes cronjob, docker cron, container scheduling, kubernetes scheduling, docker scheduling, container automation, cron jobs containers, kubernetes manifests, docker compose cron',
        'scheduling',
        'cross-platform',
        'MIT',
        '#',
        88,
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
      console.log(`   File Path: /tools/containerized-cron-job-generator`);
      console.log('   Published: true');
      console.log('   Icon: 🐳');
      console.log('   Category: scheduling');
      console.log('   Platform: cross-platform');
      console.log('   License: MIT');
      console.log('   Popularity: 88');
      console.log('   SEO Title: Containerized Cron Job Generator - Kubernetes & Docker Scheduling');
      console.log('   SEO Description: Generate cron jobs for containerized applications...');
      console.log('   SEO Keywords: containerized cron job generator, kubernetes cronjob, docker cron...');
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
insertContainerizedCronJobGeneratorTool();
