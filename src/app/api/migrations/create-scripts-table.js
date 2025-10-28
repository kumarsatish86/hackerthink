const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if scripts table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scripts'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating scripts table...');
      await client.query(`
        CREATE TABLE scripts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          script_content TEXT NOT NULL,
          program_output TEXT,
          script_type VARCHAR(50) NOT NULL,
          language VARCHAR(50) NOT NULL,
          os_compatibility VARCHAR(100),
          difficulty VARCHAR(50) DEFAULT 'Beginner',
          tags TEXT[],
          featured_image TEXT,
          meta_title TEXT,
          meta_description TEXT,
          published BOOLEAN DEFAULT FALSE,
          author_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the migration
runMigration()
  .then(() => {
    console.log('Scripts table migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Scripts table migration failed:', error);
    process.exit(1);
  }); 
