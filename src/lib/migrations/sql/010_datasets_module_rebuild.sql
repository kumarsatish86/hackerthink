-- 010_datasets_module_rebuild.sql
-- Idempotent Dataset Intelligence Platform schema extensions

-- Core column extensions on datasets
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS ai_summary JSONB;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS quick_facts JSONB;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS overview_guidance JSONB;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS modality VARCHAR(100);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS commercial_use BOOLEAN;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS freshness_score NUMERIC(5,2);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS popularity_score NUMERIC(5,2);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS storage_estimate VARCHAR(100);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS ram_estimate VARCHAR(100);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS external_dataset_id VARCHAR(255);
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS security_badge BOOLEAN DEFAULT FALSE;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS stars_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_datasets_external_id ON datasets(external_dataset_id);
CREATE INDEX IF NOT EXISTS idx_datasets_popularity ON datasets(popularity_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_datasets_freshness ON datasets(freshness_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_datasets_modality ON datasets(modality);
CREATE INDEX IF NOT EXISTS idx_datasets_status_slug ON datasets(status, slug);

-- Soft link from models training data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'model_training_data') THEN
    ALTER TABLE model_training_data ADD COLUMN IF NOT EXISTS related_dataset_slug VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_model_training_data_dataset_slug ON model_training_data(related_dataset_slug);
  END IF;
END $$;

-- Satellite tables
CREATE TABLE IF NOT EXISTS dataset_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  benchmark_name VARCHAR(255) NOT NULL,
  score NUMERIC,
  metric VARCHAR(100),
  source VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  version VARCHAR(100) NOT NULL,
  release_date DATE,
  changelog TEXT,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dataset_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  version VARCHAR(100),
  title VARCHAR(255),
  body TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dataset_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  split_name VARCHAR(100) NOT NULL,
  sample_count INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS dataset_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  node_type VARCHAR(20) NOT NULL DEFAULT 'file',
  format VARCHAR(50),
  size_bytes BIGINT,
  schema_hint TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dataset_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  modality VARCHAR(50),
  label VARCHAR(255),
  text_content TEXT,
  media_url TEXT,
  metadata JSONB,
  annotations JSONB,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dataset_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  metric_key VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  value NUMERIC NOT NULL,
  source VARCHAR(50) DEFAULT 'estimated',
  confidence VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS dataset_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  series_key VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  points JSONB NOT NULL DEFAULT '[]',
  source VARCHAR(50) DEFAULT 'estimated'
);

CREATE TABLE IF NOT EXISTS dataset_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  provider VARCHAR(100),
  checksum VARCHAR(255),
  size_hint VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dataset_preprocessing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL,
  framework VARCHAR(100),
  code TEXT NOT NULL,
  tier VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dataset_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  format_name VARCHAR(100) NOT NULL,
  description TEXT,
  example_json JSONB
);

CREATE TABLE IF NOT EXISTS dataset_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT,
  authors TEXT,
  conference VARCHAR(255),
  published_at DATE,
  bibtex TEXT
);

CREATE TABLE IF NOT EXISTS dataset_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  tier VARCHAR(50),
  description TEXT
);

CREATE TABLE IF NOT EXISTS dataset_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dataset_community_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  link_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dataset_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  peer_slug VARCHAR(255),
  name VARCHAR(255),
  notes TEXT,
  samples VARCHAR(100),
  classes VARCHAR(100),
  license VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dataset_security_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  severity VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dataset_related (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  url TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS dataset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  user_id UUID,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dataset_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dataset_id, user_id)
);

CREATE TABLE IF NOT EXISTS dataset_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  user_id UUID,
  reason TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dataset_samples_dataset ON dataset_samples(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_files_dataset ON dataset_files(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_faqs_dataset ON dataset_faqs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_downloads_dataset ON dataset_downloads(dataset_id);

-- Backfill commercial_use from license heuristics
UPDATE datasets
SET commercial_use = CASE
  WHEN license ~* '(mit|apache|bsd|cc-by|openrail|cdla)' AND license !~* '(nc|non.?commercial)' THEN TRUE
  WHEN license ~* '(nc|non.?commercial|gpl)' THEN FALSE
  ELSE commercial_use
END
WHERE commercial_use IS NULL AND license IS NOT NULL;

-- Soft-link training data rows by name match
UPDATE model_training_data td
SET related_dataset_slug = d.slug
FROM datasets d
WHERE td.related_dataset_slug IS NULL
  AND (
    lower(td.dataset_name) = lower(d.name)
    OR lower(td.dataset_name) LIKE '%' || lower(d.name) || '%'
  );
