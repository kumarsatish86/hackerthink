const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function updateAuthorId() {
  const client = await pool.connect();
  
  try {
    console.log('Starting author_id column update...');
    await client.query('BEGIN');
    
    // First check if the column exists
    const columnResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      AND column_name = 'author_id'
    `);
    
    if (columnResult.rows.length > 0) {
      const dataType = columnResult.rows[0].data_type;
      console.log(`Current author_id data type: ${dataType}`);
      
      // If it's an integer, change it to UUID or TEXT
      if (dataType === 'integer') {
        console.log('Altering author_id column to accept UUID values...');
        
        // First drop any constraints that reference this column
        const constraintResult = await client.query(`
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          WHERE rel.relname = 'articles'
          AND con.contype = 'f'
          AND (
            SELECT array_position(con.conkey, attnum)
            FROM pg_attribute att
            WHERE attrelid = con.conrelid
            AND attname = 'author_id'
          ) IS NOT NULL
        `);
        
        // Drop any foreign key constraints
        for (const row of constraintResult.rows) {
          console.log(`Dropping constraint: ${row.conname}`);
          await client.query(`ALTER TABLE articles DROP CONSTRAINT "${row.conname}"`);
        }
        
        // Change column type to TEXT
        await client.query(`
          ALTER TABLE articles
          ALTER COLUMN author_id TYPE TEXT
        `);
        
        console.log('Column type changed to TEXT successfully');
      } else {
        console.log('No need to update column type as it is already non-integer');
      }
    } else {
      console.log('author_id column not found in articles table');
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
updateAuthorId()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 
