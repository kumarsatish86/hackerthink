-- 012_model_dataset_auto_link_backfill.sql
-- Conservatively fill model_training_data.related_dataset_slug for existing rows.
-- Exact name / slug / HF external id only (no fuzzy LIKE).

UPDATE model_training_data td
SET related_dataset_slug = d.slug,
    metadata = COALESCE(td.metadata, '{}'::jsonb) || jsonb_build_object(
      'auto_linked', true,
      'link_source', 'backfill_012',
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
  );

CREATE INDEX IF NOT EXISTS idx_model_training_data_related_slug
  ON model_training_data(related_dataset_slug)
  WHERE related_dataset_slug IS NOT NULL;
