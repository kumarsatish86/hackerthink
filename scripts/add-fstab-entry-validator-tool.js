const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertFstabEntryValidatorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Fstab Entry Validator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['fstab-entry-validator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: fstab-entry-validator');
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
        'Fstab Entry Validator',
        'fstab-entry-validator',
        'Validate existing /etc/fstab entries and identify potential configuration issues. Check for syntax errors, invalid mount options, missing directories, and other common problems that could prevent your system from booting properly.',
        '🔍',
        '/tools/fstab-entry-validator',
        true,
        'Fstab Entry Validator - Check Your Mount Configuration',
        'Validate existing /etc/fstab entries for syntax errors, invalid mount options, missing directories, and other configuration issues that could prevent proper system boot.',
        'fstab entry validator, etc fstab validation, mount configuration checker, fstab syntax checker, mount point validator, filesystem mount validation, linux fstab checker, mount configuration validator, fstab error checker, linux boot validation',
        'filesystem',
        'linux',
        'MIT',
        '#',
        86,
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
      console.log(`   File Path: /tools/fstab-entry-validator`);
      console.log('   Published: true');
      console.log('   Icon: 🔍');
      console.log('   Category: filesystem');
      console.log('   Platform: linux');
      console.log('   License: MIT');
      console.log('   Popularity: 86');
      console.log('   SEO Title: Fstab Entry Validator - Check Your Mount Configuration');
      console.log('   SEO Description: Validate existing /etc/fstab entries...');
      console.log('   SEO Keywords: fstab entry validator, etc fstab validation...');
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
insertFstabEntryValidatorTool();
