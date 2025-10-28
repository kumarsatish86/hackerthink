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

    // Check if lab_exercises table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_exercises'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating lab_exercises table...');
      await client.query(`
        CREATE TABLE lab_exercises (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          content TEXT NOT NULL,
          instructions TEXT NOT NULL,
          solution TEXT,
          difficulty VARCHAR(50) DEFAULT 'Beginner',
          duration INTEGER DEFAULT 30,
          prerequisites TEXT,
          related_course_id INTEGER,
          featured_image TEXT,
          meta_title TEXT,
          meta_description TEXT,
          schema_json TEXT,
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
    console.log('Lab exercises table migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Lab exercises table migration failed:', error);
    process.exit(1);
  }); 
