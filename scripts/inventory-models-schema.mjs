import { Pool } from 'pg';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const presetKeys = new Set(
  Object.keys(process.env).filter((k) => process.env[k] !== undefined && process.env[k] !== '')
);

function loadEnv(file) {
  const path = resolve(file);
  if (!existsSync(path)) return;
  try {
    const text = readFileSync(path, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim().replace(/^["']|["']$/g, '');
      if (presetKeys.has(key)) continue;
      process.env[key] = value;
    }
  } catch {}
}

// Later files override earlier (.env.production wins over stale localhost in .env)
loadEnv('.env');
loadEnv('.env.production');
loadEnv('.env.local');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const expectedTables = [
  'ai_models',
  'ai_model_benchmarks',
  'ai_model_versions',
  'model_ratings',
  'model_benchmarks',
  'model_variants',
  'model_training_data',
  'model_community_links',
  'model_usage_examples',
  'model_comparisons',
  'model_changelog',
  'model_versions',
  'model_install_guides',
  'model_architecture_nodes',
  'model_faqs',
  'model_tutorials',
  'model_papers',
  'model_use_case_cards',
  'model_api_docs',
  'model_security_notes',
  'model_comments',
  'model_bookmarks',
  'model_download_daily',
];

const expectedCoreCols = [
  'verified',
  'security_badge',
  'compatibility_badge',
  'external_model_id',
  'task',
  'framework',
  'input_types',
  'output_types',
  'param_count_b',
  'model_size_bytes',
  'trending_rank',
  'likes_count',
  'stars_count',
  'playground_config',
  'ai_summary',
  'quick_facts',
  'compatibility_matrix',
];

const { rows: tables } = await pool.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public'
    AND (table_name LIKE '%model%' OR table_name LIKE '%import%')
  ORDER BY table_name
`);

const { rows: cols } = await pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='ai_models'
  ORDER BY ordinal_position
`);

const liveTables = tables.map((r) => r.table_name);
const liveCols = cols.map((r) => r.column_name);

const missingTables = expectedTables.filter((t) => !liveTables.includes(t));
const missingCols = expectedCoreCols.filter((c) => !liveCols.includes(c));

const report = `# Models Schema Inventory

Generated: ${new Date().toISOString()}

## Live model-related tables (${liveTables.length})
${liveTables.map((t) => `- ${t}`).join('\n')}

## ai_models columns (${liveCols.length})
${cols.map((r) => `- \`${r.column_name}\` (${r.data_type})`).join('\n')}

## Missing expected tables
${missingTables.length ? missingTables.map((t) => `- ${t}`).join('\n') : '- none'}

## Missing expected core columns
${missingCols.length ? missingCols.map((c) => `- ${c}`).join('\n') : '- none'}

## Gaps
- Dual benchmark table naming (\`ai_model_benchmarks\` vs \`model_benchmarks\`)
- Many satellite tables defined in code but not applied
- Enrichment JSON blobs need backfill into child tables
`;

writeFileSync('docs/models-schema-inventory.md', report);
console.log(report);
await pool.end();
