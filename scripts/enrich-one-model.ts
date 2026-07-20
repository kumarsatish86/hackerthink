import { loadCliEnv, logDbTarget } from './load-cli-env.mjs';

loadCliEnv();
logDbTarget();

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/enrich-one-model.ts <slug>');
    process.exit(1);
  }

  const { enrichModelDocsBySlug } = await import('../src/services/enrichment/ModelDocsEnrichment');
  const result = await enrichModelDocsBySlug(slug);
  console.log(JSON.stringify(result, null, 2));
  const { end } = await import('../src/lib/db.js');
  await end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
