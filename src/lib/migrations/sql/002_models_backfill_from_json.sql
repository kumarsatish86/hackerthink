-- 002_models_backfill_from_json.sql
-- Derive param_count_b, external_model_id, task, likes, and seed child rows from existing JSON

-- external_model_id from HF url / import metadata
UPDATE ai_models
SET external_model_id = COALESCE(
  external_model_id,
  NULLIF(import_metadata->>'modelId', ''),
  NULLIF(import_metadata->>'id', ''),
  CASE
    WHEN huggingface_url IS NOT NULL AND huggingface_url ~ 'huggingface\.co/'
    THEN regexp_replace(huggingface_url, '^https?://(www\.)?huggingface\.co/', '')
    ELSE NULL
  END
)
WHERE external_model_id IS NULL;

-- task from model_type or tags
UPDATE ai_models
SET task = COALESCE(
  NULLIF(task, ''),
  NULLIF(model_type, ''),
  NULLIF(import_metadata->'filter_facets'->>'pipeline_tag', ''),
  NULLIF(import_metadata->>'pipeline_tag', '')
)
WHERE task IS NULL OR task = '';

-- framework from training_framework / tags / libraries
UPDATE ai_models
SET framework = COALESCE(
  NULLIF(framework, ''),
  NULLIF(training_framework, ''),
  NULLIF(import_metadata->'filter_facets'->'libraries'->>0, ''),
  'transformers'
)
WHERE framework IS NULL OR framework = '';

-- Parse parameters like "7B", "1.5B", "700M" into param_count_b
UPDATE ai_models
SET param_count_b = CASE
  WHEN parameters ~* '([0-9]+\\.?[0-9]*)\\s*b' THEN
    (regexp_match(parameters, '([0-9]+\\.?[0-9]*)\\s*[Bb]', 'i'))[1]::numeric
  WHEN parameters ~* '([0-9]+\\.?[0-9]*)\\s*m' THEN
    (regexp_match(parameters, '([0-9]+\\.?[0-9]*)\\s*[Mm]', 'i'))[1]::numeric / 1000.0
  WHEN parameters ~* '^[0-9]+\\.?[0-9]*$' THEN parameters::numeric
  ELSE param_count_b
END
WHERE param_count_b IS NULL AND parameters IS NOT NULL;

-- likes / stars from community / github stats
UPDATE ai_models
SET
  likes_count = COALESCE(
    likes_count,
    NULLIF((community_stats->>'likes')::int, 0),
    NULLIF((import_metadata->>'likes')::int, 0),
    0
  ),
  stars_count = COALESCE(
    stars_count,
    NULLIF((github_stats->>'stars')::int, 0),
    0
  )
WHERE TRUE;

-- Seed community links from community_links JSON array of {title,url} or strings
INSERT INTO model_community_links (model_id, title, url, link_type)
SELECT
  m.id,
  COALESCE(elem->>'title', elem->>'name', 'Community Link'),
  COALESCE(elem->>'url', elem->>'href', elem#>>'{}'),
  COALESCE(elem->>'type', 'community')
FROM ai_models m
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(m.community_links) = 'array' THEN m.community_links ELSE '[]'::jsonb END
) AS elem
WHERE COALESCE(elem->>'url', elem->>'href', CASE WHEN jsonb_typeof(elem) = 'string' THEN elem#>>'{}' ELSE NULL END) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM model_community_links c
    WHERE c.model_id = m.id
      AND c.url = COALESCE(elem->>'url', elem->>'href', elem#>>'{}')
  );

-- Seed tutorials from tutorial_links
INSERT INTO model_tutorials (model_id, title, url, difficulty, description)
SELECT
  m.id,
  COALESCE(elem->>'title', elem->>'name', 'Tutorial'),
  COALESCE(elem->>'url', elem->>'href'),
  COALESCE(elem->>'difficulty', 'beginner'),
  elem->>'description'
FROM ai_models m
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(m.tutorial_links) = 'array' THEN m.tutorial_links ELSE '[]'::jsonb END
) AS elem
WHERE COALESCE(elem->>'url', elem->>'href') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM model_tutorials t
    WHERE t.model_id = m.id AND t.url = COALESCE(elem->>'url', elem->>'href')
  );

-- Seed papers from research_papers
INSERT INTO model_papers (model_id, title, url, authors, paper_type)
SELECT
  m.id,
  COALESCE(elem->>'title', 'Research Paper'),
  COALESCE(elem->>'url', elem->>'href', m.paper_url),
  elem->>'authors',
  COALESCE(elem->>'type', 'original')
FROM ai_models m
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(m.research_papers) = 'array' THEN m.research_papers
    WHEN m.paper_url IS NOT NULL THEN jsonb_build_array(jsonb_build_object('title', m.name || ' Paper', 'url', m.paper_url))
    ELSE '[]'::jsonb
  END
) AS elem
WHERE COALESCE(elem->>'url', elem->>'href', m.paper_url) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM model_papers p
    WHERE p.model_id = m.id AND p.url = COALESCE(elem->>'url', elem->>'href', m.paper_url)
  );

-- Seed download rollup baseline from download_count (today)
INSERT INTO model_download_daily (model_id, day, downloads)
SELECT id, CURRENT_DATE, COALESCE(download_count, 0)
FROM ai_models
ON CONFLICT (model_id, day) DO UPDATE SET downloads = GREATEST(model_download_daily.downloads, EXCLUDED.downloads);

-- Default playground_config from demo_url
UPDATE ai_models
SET playground_config = COALESCE(playground_config, '{}'::jsonb) || jsonb_build_object(
  'demo_url', demo_url,
  'embed_url', demo_url,
  'modality', COALESCE(task, model_type, 'text')
)
WHERE demo_url IS NOT NULL
  AND (playground_config IS NULL OR playground_config = '{}'::jsonb OR playground_config->>'demo_url' IS NULL);
