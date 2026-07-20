import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';

function loadEnv(file) {
  try {
    const text = readFileSync(resolve(file), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
}
loadEnv('.env.local');
loadEnv('.env');

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
