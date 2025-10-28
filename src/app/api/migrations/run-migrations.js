const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// Import command objects from the migration files
const { blogbenchCommand } = require('./add-blogbench-command');
const { bluetoothctlCommand } = require('./add-bluetoothctl-command');
const { breakCommand } = require('./add-break-command');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting migrations for commands...');

    // Check and add blogbench command
    await addCommand(client, 'blogbench', blogbenchCommand);
    
    // Check and add bluetoothctl command
    await addCommand(client, 'bluetoothctl', bluetoothctlCommand);
    
    // Check and add break command
    await addCommand(client, 'break', breakCommand);

    await client.query('COMMIT');
    console.log('All migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migrations:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

async function addCommand(client, slug, commandObj) {
  try {
    // Check if command already exists
    console.log(`Checking if ${slug} command exists...`);
    const commandCheck = await client.query(
      'SELECT * FROM commands WHERE slug = $1',
      [slug]
    );
    
    if (commandCheck.rows.length > 0) {
      console.log(`${slug} command already exists.`);
      return;
    }
    
    // Insert command
    console.log(`Adding ${slug} command to database...`);
    const result = await client.query(
      `INSERT INTO commands (
        title, 
        slug, 
        description, 
        syntax,
        examples,
        options,
        notes,
        category,
        platform,
        icon,
        published,
        seo_title,
        seo_description,
        seo_keywords
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        commandObj.title,
        commandObj.slug,
        commandObj.description,
        commandObj.syntax,
        commandObj.examples,
        commandObj.options,
        commandObj.notes,
        commandObj.category,
        commandObj.platform,
        commandObj.icon,
        commandObj.published,
        commandObj.seo_title,
        commandObj.seo_description,
        commandObj.seo_keywords
      ]
    );
    
    console.log(`${slug} command added successfully with ID:`, result.rows[0].id);
  } catch (error) {
    console.error(`Error adding ${slug} command:`, error);
    throw error;
  }
}

// Run the migrations
runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 
