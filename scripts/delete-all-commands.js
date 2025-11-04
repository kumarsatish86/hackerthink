const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function deleteAllCommands() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Deleting all commands from database...\n');
    
    // Check if commands table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'commands'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Commands table does not exist. Nothing to delete.');
      await client.query('COMMIT');
      return;
    }

    // Count commands before deletion
    const countResult = await client.query('SELECT COUNT(*) FROM commands');
    const count = countResult.rows[0].count;
    console.log(`Found ${count} commands to delete.`);

    if (count === '0') {
      console.log('No commands found. Nothing to delete.');
      await client.query('COMMIT');
      return;
    }

    // Delete all commands
    const deleteResult = await client.query('DELETE FROM commands');
    console.log(`✅ Deleted ${count} commands from the database.`);

    // Optionally drop the table (commented out for safety)
    // console.log('Dropping commands table...');
    // await client.query('DROP TABLE IF EXISTS commands CASCADE');
    // console.log('✅ Commands table dropped.');

    await client.query('COMMIT');
    console.log('\n🎉 All commands have been removed from the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

deleteAllCommands()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

