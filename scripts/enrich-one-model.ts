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
