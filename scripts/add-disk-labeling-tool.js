const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertDiskLabelingTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Disk Labeling Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['disk-labeling-tool']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: disk-labeling-tool');
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
        'Disk Labeling Tool (ext4, xfs, etc.)',
        'disk-labeling-tool',
        'Label and manage filesystem labels for various filesystem types including ext4, xfs, btrfs, fat32, and ntfs. Generate commands to read, set, or remove labels with proper syntax for each filesystem type.',
        '🏷️',
        '/tools/disk-labeling-tool',
        true,
        'Disk Labeling Tool - Manage Filesystem Labels for ext4, xfs, btrfs, and More',
        'Label and manage filesystem labels for various filesystem types. Generate commands to read, set, or remove labels with proper syntax for ext4, xfs, btrfs, fat32, ntfs, and other filesystems.',
        'disk labeling tool, filesystem labels, ext4 labels, xfs labels, btrfs labels, fat32 labels, ntfs labels, e2label, xfs_admin, btrfs filesystem label, fatlabel, ntfslabel, linux filesystem management, disk labels, partition labels',
        'filesystem',
        'linux',
        'MIT',
        '#',
        81,
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
      console.log(`   File Path: /tools/disk-labeling-tool`);
      console.log('   Published: true');
      console.log('   Icon: 🏷️');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 81');
      console.log('   SEO Title: Disk Labeling Tool - Manage Filesystem Labels for ext4, xfs, btrfs, and More');
      console.log('   SEO Description: Label and manage filesystem labels...');
      console.log('   SEO Keywords: disk labeling tool, filesystem labels...');
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
insertDiskLabelingTool();
