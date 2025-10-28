import { Pool } from 'pg';

// Create a PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ainews',
  password: process.env.DB_PASSWORD || 'Admin1234',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Log connection status
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
}); 
