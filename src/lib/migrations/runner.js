/**
 * Models module migration runner (raw SQL + pg).
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { query, transaction } from '../db.js';

export function getMigrationsDir() {
  return join(process.cwd(), 'src', 'lib', 'migrations', 'sql');
}

export async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export function listMigrationFiles() {
  const dir = getMigrationsDir();
  return readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

export async function getAppliedMigrations() {
  await ensureMigrationsTable();
  const result = await query('SELECT name, applied_at FROM schema_migrations ORDER BY name');
  return result.rows;
}

export async function getMigrationStatus() {
  const files = listMigrationFiles();
  const applied = await getAppliedMigrations();
  const appliedSet = new Set(applied.map((r) => r.name));
  return {
    files,
    applied,
    pending: files.filter((f) => !appliedSet.has(f)),
  };
}

export async function applyPendingMigrations() {
  const status = await getMigrationStatus();
  const dir = getMigrationsDir();
  const appliedNow = [];

  for (const name of status.pending) {
    const sql = readFileSync(join(dir, name), 'utf8');
    await transaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [
        name,
      ]);
    });
    appliedNow.push(name);
  }

  return { applied: appliedNow, remaining: (await getMigrationStatus()).pending };
}

export async function applyMigrationByName(name) {
  const files = listMigrationFiles();
  if (!files.includes(name)) {
    throw new Error(`Migration not found: ${name}`);
  }
  const applied = await getAppliedMigrations();
  if (applied.some((r) => r.name === name)) {
    return { skipped: true, name };
  }
  const sql = readFileSync(join(getMigrationsDir(), name), 'utf8');
  await transaction(async (client) => {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
  });
  return { skipped: false, name };
}
