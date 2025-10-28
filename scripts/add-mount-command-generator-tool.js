const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertMountCommandGeneratorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Mount Command Generator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['mount-command-generator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: mount-command-generator');
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
        'Mount Command Generator',
        'mount-command-generator',
        'Generate proper mount commands for various filesystem types and scenarios. Create mount commands with appropriate options, validate syntax, and get ready-to-use commands for mounting filesystems, network shares, and special devices.',
        '🔗',
        '/tools/mount-command-generator',
        true,
        'Mount Command Generator - Create Linux Mount Commands',
        'Generate proper mount commands for any filesystem type with appropriate options. Create commands for local filesystems, network shares, and special devices with validation.',
        'mount command generator, linux mount command, filesystem mounting, mount options, network filesystem mount, nfs mount, cifs mount, sshfs mount, linux filesystem tools, mount syntax generator',
        'filesystem',
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
      console.log(`   File Path: /tools/mount-command-generator`);
      console.log('   Published: true');
      console.log('   Icon: 🔗');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 85');
      console.log('   SEO Title: Mount Command Generator - Create Linux Mount Commands');
      console.log('   SEO Description: Generate proper mount commands for any filesystem type...');
      console.log('   SEO Keywords: mount command generator, linux mount command...');
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
insertMountCommandGeneratorTool();
