const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertMountOptionExplainerTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Mount Option Explainer Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['mount-option-explainer']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: mount-option-explainer');
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
        'Mount Option Explainer',
        'mount-option-explainer',
        'Understand what different mount options do and when to use them. Learn about performance options, security settings, network configurations, and how different options affect your filesystem behavior and system performance.',
        '📚',
        '/tools/mount-option-explainer',
        true,
        'Mount Option Explainer - Understand Linux Mount Options',
        'Learn what different mount options do and when to use them. Understand performance, security, network, and behavior options for optimal filesystem configuration.',
        'mount option explainer, linux mount options, mount option guide, filesystem mount options, mount performance options, mount security options, mount network options, linux filesystem guide, mount option reference, mount option tutorial',
        'filesystem',
        'linux',
        'MIT',
        '#',
        84,
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
      console.log(`   File Path: /tools/mount-option-explainer`);
      console.log('   Published: true');
      console.log('   Icon: 📚');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 84');
      console.log('   SEO Title: Mount Option Explainer - Understand Linux Mount Options');
      console.log('   SEO Description: Learn what different mount options do...');
      console.log('   SEO Keywords: mount option explainer, linux mount options...');
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
insertMountOptionExplainerTool();
