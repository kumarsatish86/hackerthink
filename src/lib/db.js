// Database connection utilities
import { Pool } from 'pg';

// Create a database connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Execute a database query
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query: ${text.substring(0, 40)}... | Duration: ${duration}ms | Rows: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a single row from a query
export async function queryOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

// Execute a transaction with multiple queries
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close all database connections - useful for tests and CLI scripts
export async function end() {
  await pool.end();
}

// Default export for convenience
export default { query, queryOne, transaction, end }; 