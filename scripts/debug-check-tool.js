console.log('=== Debug Script Started ===');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test basic database connection
try {
  const { Pool } = require('pg');
  console.log('✅ pg module loaded successfully');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin1234',
    database: process.env.DB_NAME || 'ainews',
  });
  
  console.log('✅ Pool created successfully');
  console.log('Database config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'ainews'
  });
  
  // Test connection
  const client = await pool.connect();
  console.log('✅ Database connection successful');
  
  // Test simple query
  const result = await client.query('SELECT NOW() as current_time');
  console.log('✅ Query successful:', result.rows[0]);
  
  client.release();
  await pool.end();
  console.log('✅ Connection closed successfully');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('=== Debug Script Finished ===');
