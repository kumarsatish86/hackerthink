-- 011_datasets_numeric_overflow_fix.sql
-- Fix numeric overflow on HF import (quality_score was NUMERIC(3,2) max 9.99)
-- and download_count integer overflow for huge HF download totals.

ALTER TABLE datasets
  ALTER COLUMN quality_score TYPE NUMERIC(5,2)
  USING LEAST(COALESCE(quality_score, 0), 999.99);

ALTER TABLE datasets
  ALTER COLUMN download_count TYPE BIGINT
  USING COALESCE(download_count, 0)::bigint;

ALTER TABLE datasets
  ALTER COLUMN view_count TYPE BIGINT
  USING COALESCE(view_count, 0)::bigint;

ALTER TABLE datasets
  ALTER COLUMN stars_count TYPE BIGINT
  USING COALESCE(stars_count, 0)::bigint;
