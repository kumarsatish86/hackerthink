const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function removeSigninRedirect() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, check if there's a problematic redirect causing the loop
    const { rows } = await client.query(
      "SELECT id, source_url, target_url, redirect_type FROM url_redirects WHERE source_url = '/auth/signin'"
    );
    
    if (rows.length > 0) {
      console.log('Found problematic signin redirects:');
      for (const row of rows) {
        console.log(`  ID: ${row.id}, Source: ${row.source_url}, Target: ${row.target_url}, Type: ${row.redirect_type}`);
      }
      
      // Delete the problematic redirects
      const deleteResult = await client.query(
        "DELETE FROM url_redirects WHERE source_url = '/auth/signin'"
      );
      
      console.log(`Deleted ${deleteResult.rowCount} problematic signin redirects.`);
    } else {
      console.log('No problematic signin redirects found.');
    }
    
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error removing signin redirect:', e);
    throw e;
  } finally {
    client.release();
  }
}

// Run the function to remove the problematic redirect
removeSigninRedirect().catch(e => {
  console.error('Failed to remove signin redirect:', e);
  process.exit(1);
}).finally(() => {
  // Disconnect from the pool when done
  pool.end();
}); 
