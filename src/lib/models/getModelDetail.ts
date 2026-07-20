import { query, queryOne } from '@/lib/db';
import type { ModelDetailPayload, ModelDownloadAnalytics, ModelRelatedItem } from '@/types/models';

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

export async function getModelBySlug(slug: string) {
  return queryOne(`SELECT * FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
}

export async function getModelDownloadAnalytics(modelId: string, totalDownloads = 0): Promise<ModelDownloadAnalytics> {
  const trendRes = await query(
    `SELECT day::text AS day, downloads
     FROM model_download_daily
     WHERE model_id = $1 AND day >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY day ASC`,
    [modelId]
  );
  const sums = await queryOne(
    `SELECT
       COALESCE(SUM(CASE WHEN day = CURRENT_DATE THEN downloads ELSE 0 END), 0)::int AS today,
       COALESCE(SUM(CASE WHEN day >= CURRENT_DATE - INTERVAL '7 days' THEN downloads ELSE 0 END), 0)::int AS weekly,
       COALESCE(SUM(CASE WHEN day >= CURRENT_DATE - INTERVAL '30 days' THEN downloads ELSE 0 END), 0)::int AS monthly
     FROM model_download_daily WHERE model_id = $1`,
    [modelId]
  );

  const today = Number(sums?.today || 0);
  const weekly = Number(sums?.weekly || 0);
  const monthly = Number(sums?.monthly || 0);
  const total = Number(totalDownloads || 0);
  const popularity_score = Math.min(100, Math.round(Math.log10(total + 1) * 20 + weekly / 10));

  return {
    today,
    weekly,
    monthly,
    total,
    trend: trendRes.rows.map((r: any) => ({ day: r.day, downloads: Number(r.downloads || 0) })),
    popularity_score,
  };
}

export async function getRelatedForModel(model: any): Promise<ModelRelatedItem[]> {
  const tags = asArray(model.tags).slice(0, 5);
  const task = model.task || model.model_type;
  const related: ModelRelatedItem[] = [];

  const peers = await query(
    `SELECT name, slug, description FROM ai_models
     WHERE status = 'published' AND id <> $1
       AND (
         ($2::text IS NOT NULL AND (task = $2 OR model_type = $2))
         OR (tags ?| $3::text[])
       )
     ORDER BY download_count DESC NULLS LAST
     LIMIT 6`,
    [model.id, task || null, tags.length ? tags : ['__none__']]
  );
  for (const row of peers.rows) {
    related.push({
      type: 'model',
      title: row.name,
      slug: row.slug,
      url: `/models/${row.slug}`,
      description: row.description || undefined,
    });
  }

  try {
    const datasets = await query(
      `SELECT name, slug, description FROM datasets
       WHERE status = 'published'
         AND ($1::text IS NOT NULL AND (categories::text ILIKE '%' || $1 || '%' OR tags::text ILIKE '%' || $1 || '%'))
       ORDER BY updated_at DESC NULLS LAST
       LIMIT 4`,
      [task || '']
    );
    for (const row of datasets.rows) {
      related.push({
        type: 'dataset',
        title: row.name,
        slug: row.slug,
        url: `/datasets/${row.slug}`,
        description: row.description || undefined,
      });
    }
  } catch {
    // datasets table optional
  }

  return related;
}

export async function getModelDetailBySlug(slug: string): Promise<ModelDetailPayload | null> {
  const model = await getModelBySlug(slug);
  if (!model) return null;

  // bump views (fire-and-forget style)
  query(`UPDATE ai_models SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1`, [model.id]).catch(() => {});

  const [
    benchmarks,
    versions,
    changelog,
    variants,
    training_data,
    usage_examples,
    install_guides,
    architecture_nodes,
    faqs,
    tutorials,
    papers,
    use_case_cards,
    api_docs,
    security_notes,
    comparisons,
    community_links,
  ] = await Promise.all([
    query(`SELECT * FROM model_benchmarks WHERE model_id = $1 ORDER BY benchmark_name`, [model.id]),
    query(`SELECT * FROM model_versions WHERE model_id = $1 ORDER BY release_date DESC NULLS LAST, version DESC`, [model.id]),
    query(`SELECT * FROM model_changelog WHERE model_id = $1 ORDER BY released_at DESC NULLS LAST, created_at DESC`, [model.id]),
    query(
      `SELECT v.*, m.slug FROM model_variants v
       LEFT JOIN ai_models m ON m.id = v.variant_model_id
       WHERE v.model_id = $1 ORDER BY sort_order, name`,
      [model.id]
    ),
    query(`SELECT * FROM model_training_data WHERE model_id = $1 ORDER BY dataset_name`, [model.id]),
    query(`SELECT * FROM model_usage_examples WHERE model_id = $1 ORDER BY sort_order, title`, [model.id]),
    query(`SELECT * FROM model_install_guides WHERE model_id = $1 ORDER BY sort_order, target`, [model.id]),
    query(`SELECT * FROM model_architecture_nodes WHERE model_id = $1 ORDER BY sort_order, title`, [model.id]),
    query(`SELECT * FROM model_faqs WHERE model_id = $1 ORDER BY sort_order, question`, [model.id]),
    query(`SELECT * FROM model_tutorials WHERE model_id = $1 ORDER BY sort_order, title`, [model.id]),
    query(`SELECT * FROM model_papers WHERE model_id = $1 ORDER BY published_at DESC NULLS LAST, title`, [model.id]),
    query(`SELECT * FROM model_use_case_cards WHERE model_id = $1 ORDER BY sort_order, industry`, [model.id]),
    query(`SELECT * FROM model_api_docs WHERE model_id = $1 ORDER BY sort_order, doc_type`, [model.id]),
    query(`SELECT * FROM model_security_notes WHERE model_id = $1 ORDER BY created_at DESC`, [model.id]),
    query(
      `SELECT c.*, m.name, m.developer, m.parameters, m.license, m.slug AS resolved_slug
       FROM model_comparisons c
       LEFT JOIN ai_models m ON m.id = c.peer_model_id
       WHERE c.model_id = $1 ORDER BY sort_order`,
      [model.id]
    ),
    query(`SELECT * FROM model_community_links WHERE model_id = $1 ORDER BY title`, [model.id]),
  ]);

  const download_analytics = await getModelDownloadAnalytics(model.id, model.download_count);
  const related = await getRelatedForModel(model);

  const comparisonsMapped = comparisons.rows.map((c: any) => ({
    ...c,
    peer_slug: c.peer_slug || c.resolved_slug,
  }));

  return {
    model: {
      ...model,
      languages: asArray(model.languages),
      categories: asArray(model.categories),
      tags: asArray(model.tags),
      capabilities: asArray(model.capabilities),
      use_cases: asArray(model.use_cases),
      limitations: asArray(model.limitations),
      input_types: asArray(model.input_types),
      output_types: asArray(model.output_types),
      ai_summary: model.ai_summary || {},
      quick_facts: model.quick_facts || {},
      playground_config: model.playground_config || {},
      compatibility_matrix: model.compatibility_matrix || {},
      overview_guidance: model.overview_guidance || {},
    },
    benchmarks: benchmarks.rows,
    versions: versions.rows,
    changelog: changelog.rows,
    variants: variants.rows,
    training_data: training_data.rows,
    usage_examples: usage_examples.rows,
    install_guides: install_guides.rows,
    architecture_nodes: architecture_nodes.rows,
    faqs: faqs.rows,
    tutorials: tutorials.rows,
    papers: papers.rows,
    use_case_cards: use_case_cards.rows,
    api_docs: api_docs.rows,
    security_notes: security_notes.rows,
    comparisons: comparisonsMapped,
    community_links: community_links.rows,
    download_analytics,
    related,
  };
}
