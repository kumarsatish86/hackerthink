/**
 * Apply pending models SQL migrations (CLI).
 * Usage (from project root):
 *   node scripts/apply-models-migrations.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { loadCliEnv, logDbTarget } from './load-cli-env.mjs';

loadCliEnv();
logDbTarget();

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT || 5432);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const ssl = process.env.DB_SSL === 'true';

if (!host || !database || !user) {
  console.error(`
Missing database config. Need DB_HOST, DB_USER, DB_NAME (and usually DB_PASSWORD).

Currently:
  DB_HOST=${host || '(empty → pg defaults to 127.0.0.1)'}
  DB_PORT=${process.env.DB_PORT || '(empty → 5432)'}
  DB_USER=${user || '(empty)'}
  DB_NAME=${database || '(empty)'}
  DB_SSL=${process.env.DB_SSL || '(empty)'}

Fix on the server:
  1) Put credentials in /opt/hackerthink/.env.production  (or .env)
  2) Or export them before running:
       export DB_HOST=... DB_PORT=5555 DB_USER=... DB_PASSWORD=... DB_NAME=... DB_SSL=true
       node scripts/apply-models-migrations.mjs
`);
  process.exit(1);
}

const pool = new Pool({
  host,
  port,
  user,
  password,
  database,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

const dir = join(process.cwd(), 'src', 'lib', 'migrations', 'sql');

try {
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
} catch (e) {
  console.error('Migration connection/query failed:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
