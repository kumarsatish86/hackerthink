const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function updateGlossaryTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting glossary_terms table update...');
    await client.query('BEGIN');
    
    // First check if the table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'glossary_terms'
      )
    `);
    
    const tableExists = tableResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating glossary_terms table...');
      await client.query(`
        CREATE TABLE glossary_terms (
          id SERIAL PRIMARY KEY,
          term VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          definition TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table created successfully');
    } else {
      console.log('glossary_terms table already exists');
    }
    
    // Rename the table name if it's "terms" instead of "glossary_terms"
    const termsTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'terms'
      )
    `);
    
    const termsTableExists = termsTableResult.rows[0].exists;
    
    if (termsTableExists) {
      console.log('Found "terms" table, checking if we need to rename it...');
      
      // Check if it has content and glossary_terms doesn't
      const termsCountResult = await client.query('SELECT COUNT(*) FROM terms');
      const termsCount = parseInt(termsCountResult.rows[0].count);
      
      const glossaryCountResult = await client.query('SELECT COUNT(*) FROM glossary_terms');
      const glossaryCount = parseInt(glossaryCountResult.rows[0].count);
      
      if (termsCount > 0 && glossaryCount === 0) {
        console.log('Migrating data from terms to glossary_terms...');
        
        // Copy the data
        await client.query(`
          INSERT INTO glossary_terms (
            term, 
            slug, 
            definition, 
            category, 
            created_at, 
            updated_at
          )
          SELECT 
            term, 
            slug, 
            definition, 
            category, 
            created_at, 
            updated_at
          FROM terms
        `);
        
        console.log('Data migrated successfully');
      }
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute the migration
updateGlossaryTable()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 
