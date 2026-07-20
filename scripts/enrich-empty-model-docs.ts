import { loadCliEnv, logDbTarget } from './load-cli-env.mjs';

loadCliEnv();
logDbTarget();

async function main() {
  const { query, end } = await import('../src/lib/db.js');
  const { enrichModelDocsBySlug } = await import('../src/services/enrichment/ModelDocsEnrichment');

  const result = await query(`
    SELECT slug FROM ai_models
    WHERE ai_summary IS NULL
       OR ai_summary = '{}'::jsonb
       OR COALESCE(ai_summary->>'what', '') = ''
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 100
  `);

  console.log(`Found ${result.rows.length} models needing AI docs`);
  for (const row of result.rows) {
    try {
      const summary = await enrichModelDocsBySlug(row.slug);
      console.log('OK', row.slug, summary.counts);
    } catch (e: any) {
      console.error('FAIL', row.slug, e?.message || e);
    }
  }
  await end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
