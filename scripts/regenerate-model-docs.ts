/**
 * Regenerate AI docs for published models.
 * Usage: npx tsx scripts/regenerate-model-docs.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(file: string) {
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

async function main() {
  const { query } = await import('../src/lib/db.js');
  const { enrichModelDocsBySlug } = await import('../src/services/enrichment/ModelDocsEnrichment');

  const result = await query(
    `SELECT slug FROM ai_models WHERE status = 'published' ORDER BY updated_at DESC NULLS LAST LIMIT 50`
  );

  console.log(`Enriching ${result.rows.length} models...`);
  for (const row of result.rows) {
    try {
      const summary = await enrichModelDocsBySlug(row.slug);
      console.log('OK', row.slug, summary);
    } catch (e: any) {
      console.error('FAIL', row.slug, e?.message || e);
    }
  }

  const { end } = await import('../src/lib/db.js');
  await end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
