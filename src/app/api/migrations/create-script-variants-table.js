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

    // Check if script_variants table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'script_variants'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating script_variants table...');
      await client.query(`
        CREATE TABLE script_variants (
          id SERIAL PRIMARY KEY,
          script_id INTEGER NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
          language VARCHAR(50) NOT NULL,
          script_content TEXT NOT NULL,
          program_output TEXT,
          file_extension VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(script_id, language)
        )
      `);

      // Create index for better performance
      await client.query(`
        CREATE INDEX idx_script_variants_script_id ON script_variants(script_id);
      `);

      await client.query(`
        CREATE INDEX idx_script_variants_language ON script_variants(language);
      `);
    }

    // Add new columns to scripts table for multi-language support
    console.log('Adding multi-language support columns to scripts table...');
    
    // Check if columns already exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'scripts' 
      AND column_name IN ('is_multi_language', 'primary_language', 'available_languages')
    `);

    const existingColumns = columnCheck.rows.map(row => row.column_name);

    if (!existingColumns.includes('is_multi_language')) {
      await client.query(`
        ALTER TABLE scripts ADD COLUMN is_multi_language BOOLEAN DEFAULT FALSE;
      `);
    }

    if (!existingColumns.includes('primary_language')) {
      await client.query(`
        ALTER TABLE scripts ADD COLUMN primary_language VARCHAR(50);
      `);
    }

    if (!existingColumns.includes('available_languages')) {
      await client.query(`
        ALTER TABLE scripts ADD COLUMN available_languages TEXT[];
      `);
    }

    // Update existing scripts to set primary_language based on current language field
    await client.query(`
      UPDATE scripts 
      SET primary_language = language, 
          available_languages = ARRAY[language]
      WHERE primary_language IS NULL;
    `);
    
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
    console.log('Script variants table migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script variants table migration failed:', error);
    process.exit(1);
  });

