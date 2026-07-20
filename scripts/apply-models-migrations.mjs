/**
 * Apply pending models SQL migrations (CLI).
 * Usage: node --experimental-vm-modules node_modules/tsx/dist/cli.mjs scripts/apply-models-migrations.mjs
 * Or: npx tsx scripts/apply-models-migrations.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
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

const dir = join(process.cwd(), 'src', 'lib', 'migrations', 'sql');

await pool.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const { rows: applied } = await pool.query('SELECT name FROM schema_migrations');
const appliedSet = new Set(applied.map((r) => r.name));

for (const name of files) {
  if (appliedSet.has(name)) {
    console.log('skip', name);
    continue;
  }
  const sql = readFileSync(join(dir, name), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log('applied', name);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('failed', name, e.message);
    process.exitCode = 1;
    break;
  } finally {
    client.release();
  }
}

await pool.end();
