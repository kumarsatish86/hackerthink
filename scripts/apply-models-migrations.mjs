/**
 * Apply pending models SQL migrations (CLI).
 * Usage (from project root):
 *   node scripts/apply-models-migrations.mjs
 *
 * Loads env files in order (later overrides earlier):
 *   .env → .env.production → .env.local
 * Shell-exported vars always win over file values.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { Pool } from 'pg';

/** Snapshot of env keys set before any file load (shell / systemd / pm2). */
const presetKeys = new Set(
  Object.keys(process.env).filter((k) => process.env[k] !== undefined && process.env[k] !== '')
);

/**
 * @param {string} file
 * @param {{ override?: boolean }} [opts] - if override, replace keys not preset in the shell
 */
function loadEnv(file, opts = {}) {
  const { override = true } = opts;
  const path = resolve(file);
  if (!existsSync(path)) return false;
  try {
    const text = readFileSync(path, 'utf8');
    let loaded = 0;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // Never clobber vars already exported in the shell
      if (presetKeys.has(key)) continue;
      if (override || process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
        loaded++;
      }
    }
    console.log(`Loaded env from ${file} (${loaded} keys applied)`);
    return true;
  } catch (e) {
    console.warn(`Could not read ${file}:`, e.message);
    return false;
  }
}

const loadedAny =
  loadEnv('.env') |
  loadEnv('.env.production') |
  loadEnv('.env.local');

if (!loadedAny) {
  console.warn(
    'No .env / .env.production / .env.local found. Relying on process environment only.'
  );
}

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
     Example:
       DB_HOST=your-db-host
       DB_PORT=5432
       DB_USER=...
       DB_PASSWORD=...
       DB_NAME=hackerthink
       DB_SSL=true
  2) Or export them before running:
       export DB_HOST=... DB_PORT=5432 DB_USER=... DB_PASSWORD=... DB_NAME=... DB_SSL=true
       node scripts/apply-models-migrations.mjs
`);
  process.exit(1);
}

console.log(`Connecting to postgres://${user}@${host}:${port}/${database} (ssl=${ssl})`);

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
