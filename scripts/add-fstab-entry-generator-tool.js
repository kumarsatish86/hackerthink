const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertFstabEntryGeneratorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Fstab Entry Generator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['fstab-entry-generator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: fstab-entry-generator');
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
        'Fstab Entry Generator',
        'fstab-entry-generator',
        'Generate proper /etc/fstab entries for various filesystem types. Create mount configurations with appropriate options, dump settings, and pass numbers for automatic mounting at boot time.',
        '💾',
        '/tools/fstab-entry-generator',
        true,
        'Fstab Entry Generator - Create Proper Mount Configurations',
        'Generate /etc/fstab entries for any filesystem with proper mount options, dump settings, and pass numbers for automatic boot mounting.',
        'fstab entry generator, etc fstab, mount configuration, filesystem mounting, linux mount options, fstab mount, boot mounting, filesystem configuration, mount point setup, linux filesystem',
        'filesystem',
        'linux',
        'MIT',
        '#',
        87,
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
      console.log(`   File Path: /tools/fstab-entry-generator`);
      console.log('   Published: true');
      console.log('   Icon: 💾');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 87');
      console.log('   SEO Title: Fstab Entry Generator - Create Proper Mount Configurations');
      console.log('   SEO Description: Generate /etc/fstab entries for any filesystem...');
      console.log('   SEO Keywords: fstab entry generator, etc fstab, mount configuration...');
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
insertFstabEntryGeneratorTool();
