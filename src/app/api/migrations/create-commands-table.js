const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if commands table exists
    const commandsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'commands'
      );
    `);
    
    if (!commandsTableCheck.rows[0].exists) {
      console.log('Creating commands table...');
      await client.query(`
        CREATE TABLE commands (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          syntax TEXT,
          examples TEXT,
          options TEXT,
          notes TEXT,
          category VARCHAR(50) DEFAULT 'misc',
          platform VARCHAR(50) DEFAULT 'linux',
          icon VARCHAR(50),
          file_path VARCHAR(255),
          published BOOLEAN DEFAULT false,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add index for performance
      await client.query(`
        CREATE INDEX idx_commands_slug ON commands (slug);
      `);
      
      console.log('Commands table created successfully.');
    } else {
      console.log('Commands table already exists.');
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => console.log('Migration completed successfully'))
  .catch(error => console.error('Migration failed:', error)); 
