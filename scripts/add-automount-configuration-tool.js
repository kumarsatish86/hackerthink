const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertAutoMountConfigurationTool() {
  const client = await pool.connect();

  try {
    console.log('Adding AutoMount Configuration Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['automount-configuration-tool']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: automount-configuration-tool');
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
        'AutoMount Configuration Tool',
        'automount-configuration-tool',
        'Configure automatic mounting of filesystems and devices at boot time. Create proper fstab entries, configure udev rules, and set up systemd mount units for seamless filesystem access without manual intervention.',
        '🔧',
        '/tools/automount-configuration-tool',
        true,
        'AutoMount Configuration Tool - Configure Automatic Filesystem Mounting',
        'Configure automatic mounting of filesystems and devices at boot time. Create fstab entries, udev rules, and systemd mount units for seamless filesystem access.',
        'automount configuration tool, automatic mounting, fstab configuration, udev rules, systemd mount units, boot time mounting, filesystem automation, linux mount configuration, persistent mounts, auto mount setup',
        'filesystem',
        'linux',
        'MIT',
        '#',
        83,
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
      console.log(`   File Path: /tools/automount-configuration-tool`);
      console.log('   Published: true');
      console.log('   Icon: 🔧');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 83');
      console.log('   SEO Title: AutoMount Configuration Tool - Configure Automatic Filesystem Mounting');
      console.log('   SEO Description: Configure automatic mounting of filesystems...');
      console.log('   SEO Keywords: automount configuration tool, automatic mounting...');
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
insertAutoMountConfigurationTool();
