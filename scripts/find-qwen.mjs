import { Pool } from 'pg';
import { loadCliEnv, logDbTarget } from './load-cli-env.mjs';

loadCliEnv();
logDbTarget();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const { rows } = await pool.query(
  `SELECT slug, name,
          COALESCE(ai_summary::text, '') AS ai_summary
   FROM ai_models
   WHERE slug ILIKE '%qwen%' OR name ILIKE '%qwen%'
   ORDER BY updated_at DESC NULLS LAST
   LIMIT 20`
);
console.log(rows);
await pool.end();
