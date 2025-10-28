const { Pool } = require('pg');

// Create a new pool connection to the database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function insertCrontabHumanLanguageTranslatorTool() {
  const client = await pool.connect();

  try {
    console.log('Adding Crontab Human Language Translator Tool to database...');

    // Check if tool already exists
    const checkResult = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['crontab-human-language-translator']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Tool already exists with slug: crontab-human-language-translator');
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
        'Crontab Human Language Translator',
        'crontab-human-language-translator',
        'A comprehensive Linux tool to translate between cron expressions and human language. Understand cron schedules, generate human-readable descriptions, and learn cron syntax with interactive examples and educational content.',
        'translate',
        '/tools/crontab-human-language-translator',
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
      console.log(`   File Path: /tools/crontab-human-language-translator`);
      console.log('   Published: true');
      console.log('   Icon: translate');
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
insertCrontabHumanLanguageTranslatorTool();
