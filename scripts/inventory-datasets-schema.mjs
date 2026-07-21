/**
 * Snapshot datasets schema into docs/datasets-schema-inventory.md
 * Usage: node scripts/inventory-datasets-schema.mjs
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
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

const tables = [
  'datasets',
  'dataset_ratings',
  'dataset_benchmarks',
  'dataset_versions',
  'dataset_changelog',
  'dataset_splits',
  'dataset_files',
  'dataset_samples',
  'dataset_quality_metrics',
  'dataset_statistics',
  'dataset_downloads',
  'dataset_preprocessing',
  'dataset_annotations',
  'dataset_papers',
  'dataset_tutorials',
  'dataset_faqs',
  'dataset_community_links',
  'dataset_comparisons',
  'dataset_security_notes',
  'dataset_related',
  'dataset_comments',
  'dataset_bookmarks',
  'dataset_reports',
];

let md = `# Datasets schema inventory\n\nGenerated ${new Date().toISOString()}\n\n`;

for (const table of tables) {
  try {
    const { rows } = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    md += `## ${table}\n\n`;
    if (!rows.length) {
      md += `_Table missing_\n\n`;
      continue;
    }
    md += `| Column | Type | Nullable |\n| --- | --- | --- |\n`;
    for (const r of rows) {
      md += `| ${r.column_name} | ${r.data_type} | ${r.is_nullable} |\n`;
    }
    md += `\n`;
  } catch (e) {
    md += `## ${table}\n\n_Error: ${e.message}_\n\n`;
  }
}

writeFileSync(join(process.cwd(), 'docs', 'datasets-schema-inventory.md'), md);
console.log('Wrote docs/datasets-schema-inventory.md');
await pool.end();
