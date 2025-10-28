const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertUserPrivilegeEscalationDetectorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding User Privilege Escalation Detector Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['user-privilege-escalation-detector']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: user-privilege-escalation-detector');
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
        'User Privilege Escalation Detector',
        'user-privilege-escalation-detector',
        'A comprehensive Linux security tool to detect potential privilege escalation vulnerabilities. Scan users for sudo access, SUID files, file permissions, cron jobs, and other security risks that could lead to unauthorized privilege escalation.',
        'shield',
        '/tools/user-privilege-escalation-detector',
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
      console.log(`   File Path: /tools/user-privilege-escalation-detector`);
      console.log('   Published: true');
      console.log('   Icon: shield');
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
insertUserPrivilegeEscalationDetectorTool();
