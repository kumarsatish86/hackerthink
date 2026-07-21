import { query, queryOne } from '@/lib/db';
import type {
  DatasetCore,
  DatasetDetailPayload,
  DatasetModelLink,
  DatasetRelatedItem,
} from '@/types/datasets';
import { parseJsonField, toStringArray } from './arrayUtils';

const DETAIL_TTL_MS = 60_000;
const detailCache = new Map<string, { expires: number; payload: DatasetDetailPayload }>();

export function invalidateDatasetDetailCache(slug?: string) {
  if (!slug) {
    detailCache.clear();
    return;
  }
  detailCache.delete(slug);
}

function normalizeCore(row: Record<string, unknown>): DatasetCore {
  return {
    ...(row as unknown as DatasetCore),
    features: parseJsonField(row.features, []),
    split_info: parseJsonField(row.split_info, {}),
    languages: parseJsonField(row.languages, toStringArray(row.languages)),
    task_types: parseJsonField(row.task_types, toStringArray(row.task_types)),
    categories: parseJsonField(row.categories, toStringArray(row.categories)),
    tags: parseJsonField(row.tags, toStringArray(row.tags)),
    sample_data: parseJsonField(row.sample_data, {}),
    schema_json: parseJsonField(row.schema_json, {}),
    ai_summary: parseJsonField(row.ai_summary, {}),
    quick_facts: parseJsonField(row.quick_facts, {}),
    overview_guidance: parseJsonField(row.overview_guidance, {}),
    tutorial_links: parseJsonField(row.tutorial_links, []),
    related_models: parseJsonField(row.related_models, []),
    preprocessing_tools: parseJsonField(row.preprocessing_tools, []),
    annotation_guide: parseJsonField(row.annotation_guide, {}),
    download_size_breakdown: parseJsonField(row.download_size_breakdown, {}),
    import_metadata: parseJsonField(row.import_metadata, {}),
    ideal_hardware: parseJsonField(row.ideal_hardware, {}),
  };
}

async function safeQuery(sql: string, params: unknown[] = []) {
  try {
    return await query(sql, params);
  } catch {
    return { rows: [] as Record<string, unknown>[] };
  }
}

export async function getDatasetBySlug(slug: string) {
  return queryOne(`SELECT * FROM datasets WHERE slug = $1 LIMIT 1`, [slug]);
}

export async function getModelsUsingDataset(dataset: DatasetCore): Promise<DatasetModelLink[]> {
  const name = dataset.name;
  const slug = dataset.slug;
  const map = new Map<string, DatasetModelLink>();

  const fromSlug = await safeQuery(
    `SELECT DISTINCT m.id, m.name, m.slug, m.developer, m.model_type, m.parameters, m.logo_url
     FROM ai_models m
     JOIN model_training_data td ON m.id = td.model_id
     WHERE m.status = 'published'
       AND (td.related_dataset_slug = $1 OR td.dataset_name ILIKE $2)
     ORDER BY m.download_count DESC NULLS LAST
     LIMIT 24`,
    [slug, `%${name}%`]
  );
  for (const r of fromSlug.rows) {
    map.set(String(r.id), r as unknown as DatasetModelLink);
  }

  const fromText = await safeQuery(
    `SELECT id, name, slug, developer, model_type, parameters, logo_url
     FROM ai_models
     WHERE status = 'published' AND training_data ILIKE $1
     LIMIT 12`,
    [`%${name}%`]
  );
  for (const r of fromText.rows) {
    if (!map.has(String(r.id))) map.set(String(r.id), r as unknown as DatasetModelLink);
  }

  return Array.from(map.values()).slice(0, 24);
}

async function loadDatasetDetailPayload(slug: string): Promise<DatasetDetailPayload | null> {
  const row = await getDatasetBySlug(slug);
  if (!row || row.status !== 'published') return null;

  const id = row.id;
  const [
    benchmarks,
    versions,
    changelog,
    splits,
    files,
    samples,
    quality,
    statistics,
    downloads,
    preprocessing,
    annotations,
    papers,
    tutorials,
    faqs,
    community,
    comparisons,
    security,
    relatedRows,
    similar,
  ] = await Promise.all([
    safeQuery(`SELECT * FROM dataset_benchmarks WHERE dataset_id = $1 ORDER BY benchmark_name`, [id]),
    safeQuery(`SELECT * FROM dataset_versions WHERE dataset_id = $1 ORDER BY release_date DESC NULLS LAST`, [id]),
    safeQuery(`SELECT * FROM dataset_changelog WHERE dataset_id = $1 ORDER BY changed_at DESC NULLS LAST`, [id]),
    safeQuery(`SELECT * FROM dataset_splits WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_files WHERE dataset_id = $1 ORDER BY sort_order, path`, [id]),
    safeQuery(`SELECT * FROM dataset_samples WHERE dataset_id = $1 ORDER BY sort_order LIMIT 100`, [id]),
    safeQuery(`SELECT * FROM dataset_quality_metrics WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_statistics WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_downloads WHERE dataset_id = $1 ORDER BY sort_order`, [id]),
    safeQuery(`SELECT * FROM dataset_preprocessing WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_annotations WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_papers WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_tutorials WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_faqs WHERE dataset_id = $1 ORDER BY sort_order`, [id]),
    safeQuery(`SELECT * FROM dataset_community_links WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_comparisons WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_security_notes WHERE dataset_id = $1`, [id]),
    safeQuery(`SELECT * FROM dataset_related WHERE dataset_id = $1`, [id]),
    safeQuery(
      `SELECT id, name, slug, dataset_type AS model_type, provider AS developer, logo_url, download_count
       FROM datasets
       WHERE status = 'published' AND id <> $1
         AND (dataset_type = $2 OR domain = $3)
       ORDER BY download_count DESC NULLS LAST
       LIMIT 6`,
      [id, row.dataset_type || null, row.domain || null]
    ),
  ]);

  const dataset = normalizeCore(row);
  const models_using = await getModelsUsingDataset(dataset);

  const related: DatasetRelatedItem[] = [
    ...relatedRows.rows.map((r) => ({
      id: String(r.id),
      type: String(r.type || 'resource'),
      title: String(r.title),
      slug: r.slug ? String(r.slug) : null,
      url: r.url ? String(r.url) : null,
      description: r.description ? String(r.description) : null,
    })),
    ...models_using.slice(0, 6).map((m) => ({
      id: `model-${m.id}`,
      type: 'model',
      title: m.name,
      slug: m.slug,
      url: `/models/${m.slug}`,
    })),
  ];

  const statisticsRows = statistics.rows.map((r) => ({
    ...r,
    points: parseJsonField(r.points, []),
  }));

  return {
    dataset,
    benchmarks: benchmarks.rows as DatasetDetailPayload['benchmarks'],
    versions: versions.rows as DatasetDetailPayload['versions'],
    changelog: changelog.rows as DatasetDetailPayload['changelog'],
    splits: splits.rows as DatasetDetailPayload['splits'],
    files: files.rows as DatasetDetailPayload['files'],
    samples: samples.rows as DatasetDetailPayload['samples'],
    quality_metrics: quality.rows as DatasetDetailPayload['quality_metrics'],
    statistics: statisticsRows as DatasetDetailPayload['statistics'],
    downloads: downloads.rows as DatasetDetailPayload['downloads'],
    preprocessing: preprocessing.rows as DatasetDetailPayload['preprocessing'],
    annotations: annotations.rows as DatasetDetailPayload['annotations'],
    papers: papers.rows as DatasetDetailPayload['papers'],
    tutorials: tutorials.rows as DatasetDetailPayload['tutorials'],
    faqs: faqs.rows as DatasetDetailPayload['faqs'],
    community_links: community.rows as DatasetDetailPayload['community_links'],
    comparisons: comparisons.rows as DatasetDetailPayload['comparisons'],
    security_notes: security.rows as DatasetDetailPayload['security_notes'],
    related,
    models_using,
    similar_datasets: similar.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      developer: r.developer ? String(r.developer) : null,
      model_type: r.model_type ? String(r.model_type) : null,
      logo_url: r.logo_url ? String(r.logo_url) : null,
    })),
  };
}

export async function getDatasetDetailBySlug(slug: string): Promise<DatasetDetailPayload | null> {
  const cached = detailCache.get(slug);
  const now = Date.now();
  let payload: DatasetDetailPayload | null = null;

  if (cached && cached.expires > now) {
    payload = cached.payload;
  } else {
    payload = await loadDatasetDetailPayload(slug);
    if (payload) {
      detailCache.set(slug, { expires: now + DETAIL_TTL_MS, payload });
    }
  }

  if (!payload) return null;

  try {
    await query(`UPDATE datasets SET view_count = COALESCE(view_count,0) + 1 WHERE id = $1`, [
      payload.dataset.id,
    ]);
    payload = {
      ...payload,
      dataset: {
        ...payload.dataset,
        view_count: (payload.dataset.view_count || 0) + 1,
      },
    };
  } catch {
    /* ignore */
  }

  return payload;
}
