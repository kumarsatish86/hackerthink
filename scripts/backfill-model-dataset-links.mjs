/**
 * Re-run conservative model↔dataset linking for the whole catalog.
 * Usage: node scripts/backfill-model-dataset-links.mjs
 */
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

try {
  const result = await pool.query(`
    UPDATE model_training_data td
    SET related_dataset_slug = d.slug,
        metadata = COALESCE(td.metadata, '{}'::jsonb) || jsonb_build_object(
          'auto_linked', true,
          'link_source', 'cli_backfill',
          'linked_at', NOW()::text
        )
    FROM datasets d
    WHERE td.related_dataset_slug IS NULL
      AND (
        lower(td.dataset_name) = lower(d.name)
        OR lower(td.dataset_name) = lower(d.slug)
        OR (
          d.external_dataset_id IS NOT NULL
          AND lower(td.dataset_name) = lower(replace(d.external_dataset_id, 'hf:', ''))
        )
      )
    RETURNING td.id
  `);
  console.log(`Linked ${result.rowCount} training-data rows to datasets.`);
} finally {
  await pool.end();
}
