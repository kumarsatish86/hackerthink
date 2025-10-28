const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function dumpTables() {
  const client = await pool.connect();
  
  try {
    console.log('Dumping database information:');
    
    // Get list of all tables
    const tableListResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n=== DATABASE TABLES ===');
    tableListResult.rows.forEach(row => {
      console.log(row.table_name);
    });
    
    // For each table, show structure and sample data
    for (const tableRow of tableListResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n=== TABLE: ${tableName} ===`);
      
      // Get columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log('\nCOLUMNS:');
      columnsResult.rows.forEach(col => {
        const typeInfo = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})` 
          : col.data_type;
        console.log(`  ${col.column_name}: ${typeInfo}`);
      });
      
      // Get count
      const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      console.log(`\nROW COUNT: ${countResult.rows[0].count}`);
      
      // Get sample data (up to 5 rows)
      if (parseInt(countResult.rows[0].count) > 0) {
        const dataResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 5`);
        console.log('\nSAMPLE DATA:');
        dataResult.rows.forEach((row, i) => {
          console.log(`  Row ${i+1}:`, JSON.stringify(row, null, 2));
        });
      }
    }
    
    console.log('\nDatabase dump completed');
    
  } catch (error) {
    console.error('Error dumping tables:', error);
  } finally {
    client.release();
  }
}

// Execute the function
dumpTables()
  .then(() => {
    console.log('\nProcess completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Process failed:', error);
    process.exit(1);
  }); 
