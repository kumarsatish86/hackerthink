const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'hackerthink',
  user: 'postgres',
  password: 'postgres',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL database');
    
    // Test a simple query
    const result = await client.query('SELECT COUNT(*) FROM tools');
    console.log('Tools count:', result.rows[0].count);
    
    await client.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();
