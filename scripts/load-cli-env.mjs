/**
 * Shared CLI env loader for Node scripts (migrations, enrichment, etc.).
 * Load order (later overrides earlier): .env → .env.production → .env.local
 * Shell-exported vars always win.
 *
 * Usage:
 *   import { loadCliEnv } from './load-cli-env.mjs';
 *   loadCliEnv();
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const presetKeys = new Set(
  Object.keys(process.env).filter((k) => process.env[k] !== undefined && process.env[k] !== '')
);

function loadFile(file) {
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
      if (presetKeys.has(key)) continue;
      process.env[key] = value;
      loaded++;
    }
    console.log(`Loaded env from ${file} (${loaded} keys applied)`);
    return true;
  } catch (e) {
    console.warn(`Could not read ${file}:`, e.message);
    return false;
  }
}

export function loadCliEnv() {
  const loaded =
    loadFile('.env') | loadFile('.env.production') | loadFile('.env.local');
  if (!loaded) {
    console.warn(
      'No .env / .env.production / .env.local found. Relying on process environment only.'
    );
  }
  return Boolean(loaded);
}

export function logDbTarget() {
  const host = process.env.DB_HOST || '(empty → 127.0.0.1)';
  const port = process.env.DB_PORT || '(empty → 5432)';
  const user = process.env.DB_USER || '(empty)';
  const database = process.env.DB_NAME || '(empty)';
  const ssl = process.env.DB_SSL === 'true';
  console.log(`DB target: postgres://${user}@${host}:${port}/${database} (ssl=${ssl})`);
}
