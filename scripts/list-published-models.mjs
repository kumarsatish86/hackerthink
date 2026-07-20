import { readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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

// Use pg directly and call enrichment via dynamic import of compiled path won't work with TS.
// Instead: inline call through next isn't available. Use a small SQL seed + node with tsx.

const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const { rows } = await pool.query(
  `SELECT slug FROM ai_models WHERE status = 'published' ORDER BY updated_at DESC NULLS LAST LIMIT 50`
);
console.log('Published models:', rows.length);
for (const r of rows) console.log(' -', r.slug);
await pool.end();

// Write slug list for tsx enrichment runner
import { writeFileSync } from 'fs';
writeFileSync('scripts/.published-model-slugs.json', JSON.stringify(rows.map((r) => r.slug), null, 2));
console.log('Wrote scripts/.published-model-slugs.json');
