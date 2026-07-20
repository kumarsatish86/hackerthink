-- 001_models_module_rebuild.sql
-- Idempotent models module schema: core columns + satellite tables + backfill helpers

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- schema_migrations already created by runner; keep safe if run standalone
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Core ai_models extensions
-- ---------------------------------------------------------------------------
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS security_badge BOOLEAN DEFAULT false;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS compatibility_badge BOOLEAN DEFAULT false;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS external_model_id VARCHAR(512);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS task VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS framework VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS input_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS output_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS param_count_b NUMERIC(12,4);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS model_size_bytes BIGINT;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS trending_rank INTEGER;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS stars_count INTEGER DEFAULT 0;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS playground_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS ai_summary JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS quick_facts JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS compatibility_matrix JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS homepage_url VARCHAR(1024);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS tokenizer VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS vocabulary_size INTEGER;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS training_framework VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS quantized_versions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS hardware_requirements JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS inference_speed TEXT;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS memory_footprint TEXT;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS model_family VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS variant_parent_id UUID REFERENCES ai_models(id) ON DELETE SET NULL;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS architecture_family VARCHAR(255);
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS detailed_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS community_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS github_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS evaluation_summary TEXT;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS known_biases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS safety_results JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS ethical_risks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS overview_guidance JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_ai_models_task ON ai_models(task);
CREATE INDEX IF NOT EXISTS idx_ai_models_framework ON ai_models(framework);
CREATE INDEX IF NOT EXISTS idx_ai_models_param_count_b ON ai_models(param_count_b);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_external_model_id ON ai_models(external_model_id);

-- ---------------------------------------------------------------------------
-- Benchmarks (canonical)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  benchmark_name VARCHAR(255) NOT NULL,
  score NUMERIC,
  metric VARCHAR(128),
  dataset VARCHAR(255),
  evaluated_at DATE,
  source_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_benchmarks_model ON model_benchmarks(model_id);

-- Backfill from legacy table if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_model_benchmarks'
  ) THEN
    INSERT INTO model_benchmarks (model_id, benchmark_name, score, metric, evaluated_at, source_url)
    SELECT b.model_id, b.benchmark_name, b.score, b.metric, b.evaluated_at, b.source_url
    FROM ai_model_benchmarks b
    WHERE NOT EXISTS (
      SELECT 1 FROM model_benchmarks mb
      WHERE mb.model_id = b.model_id
        AND mb.benchmark_name = b.benchmark_name
        AND COALESCE(mb.metric, '') = COALESCE(b.metric, '')
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Versions / changelog
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  version VARCHAR(128) NOT NULL,
  release_date DATE,
  changelog TEXT,
  breaking_changes TEXT,
  migration_guide TEXT,
  deprecated_features TEXT,
  benchmarks JSONB DEFAULT '{}'::jsonb,
  download_url TEXT,
  is_latest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_id, version)
);

CREATE TABLE IF NOT EXISTS model_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  version VARCHAR(128),
  title VARCHAR(512),
  body TEXT,
  change_type VARCHAR(64) DEFAULT 'release',
  released_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_versions_model ON model_versions(model_id);
CREATE INDEX IF NOT EXISTS idx_model_changelog_model ON model_changelog(model_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_model_versions'
  ) THEN
    INSERT INTO model_versions (model_id, version, release_date, changelog, benchmarks, download_url)
    SELECT v.model_id, v.version, v.release_date, v.changelog, COALESCE(v.benchmarks, '{}'::jsonb), v.download_url
    FROM ai_model_versions v
    ON CONFLICT (model_id, version) DO NOTHING;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Variants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  variant_model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  variant_type VARCHAR(128),
  parameters VARCHAR(128),
  quantization VARCHAR(128),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_variants_model ON model_variants(model_id);

-- ---------------------------------------------------------------------------
-- Training data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  dataset_name VARCHAR(512) NOT NULL,
  description TEXT,
  dataset_size VARCHAR(128),
  classes JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  license VARCHAR(255),
  download_url TEXT,
  quality_score NUMERIC(5,2),
  known_biases TEXT,
  related_dataset_slug VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_training_data_model ON model_training_data(model_id);

-- ---------------------------------------------------------------------------
-- Usage examples & install guides
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_usage_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  language VARCHAR(64) NOT NULL DEFAULT 'python',
  runtime VARCHAR(64),
  code TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_install_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  target VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  command TEXT,
  code TEXT,
  description TEXT,
  version_label VARCHAR(64),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_usage_examples_model ON model_usage_examples(model_id);
CREATE INDEX IF NOT EXISTS idx_model_install_guides_model ON model_install_guides(model_id);

-- ---------------------------------------------------------------------------
-- Architecture nodes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_architecture_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  node_key VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_architecture_nodes_model ON model_architecture_nodes(model_id);

-- ---------------------------------------------------------------------------
-- FAQs, tutorials, papers, use cases, API docs, security
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  title VARCHAR(512) NOT NULL,
  difficulty VARCHAR(64) DEFAULT 'beginner',
  url TEXT,
  description TEXT,
  is_video BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  title VARCHAR(1024) NOT NULL,
  authors TEXT,
  conference VARCHAR(255),
  published_at DATE,
  url TEXT,
  bibtex TEXT,
  paper_type VARCHAR(64) DEFAULT 'original',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_use_case_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  industry VARCHAR(128) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_api_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  doc_type VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  code TEXT,
  language VARCHAR(64),
  metadata JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_security_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  note_type VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  body TEXT,
  severity VARCHAR(32) DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  peer_model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  peer_slug VARCHAR(255),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_community_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  link_type VARCHAR(64) DEFAULT 'community',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_faqs_model ON model_faqs(model_id);
CREATE INDEX IF NOT EXISTS idx_model_tutorials_model ON model_tutorials(model_id);
CREATE INDEX IF NOT EXISTS idx_model_papers_model ON model_papers(model_id);
CREATE INDEX IF NOT EXISTS idx_model_use_case_cards_model ON model_use_case_cards(model_id);
CREATE INDEX IF NOT EXISTS idx_model_api_docs_model ON model_api_docs(model_id);
CREATE INDEX IF NOT EXISTS idx_model_security_notes_model ON model_security_notes(model_id);
CREATE INDEX IF NOT EXISTS idx_model_comparisons_model ON model_comparisons(model_id);
CREATE INDEX IF NOT EXISTS idx_model_community_links_model ON model_community_links(model_id);

-- ---------------------------------------------------------------------------
-- Engagement / analytics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  user_id UUID,
  parent_id UUID REFERENCES model_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_id, user_id)
);

CREATE TABLE IF NOT EXISTS model_download_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  UNIQUE(model_id, day)
);

CREATE TABLE IF NOT EXISTS model_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  user_id UUID,
  reason TEXT,
  details TEXT,
  status VARCHAR(32) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_comments_model ON model_comments(model_id);
CREATE INDEX IF NOT EXISTS idx_model_bookmarks_user ON model_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_model_download_daily_model ON model_download_daily(model_id, day);
