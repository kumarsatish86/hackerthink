/**
 * Conservative model ↔ dataset auto-linking for HF imports.
 * Prefer exact HF id / slug / name matches; avoid fuzzy LIKE linking.
 */

export type SqlClient = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

export type TrainingDatasetSource = {
  name?: string;
  id?: string;
  dataset_id?: string;
  token_count?: string;
  size?: string;
  license?: string;
  description?: string;
  url?: string;
  source?: string;
};

export type LinkedTrainingRow = {
  dataset_name: string;
  related_dataset_slug: string | null;
  created: boolean;
  linked: boolean;
};

function cleanText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract org/name from HF urls or bare ids. */
export function extractHfDatasetId(raw: string): string | null {
  const text = cleanText(raw);
  if (!text) return null;

  const urlMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?huggingface\.co\/datasets\/([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?)/i
  );
  if (urlMatch?.[1]) return urlMatch[1];

  const tagMatch = text.match(/^(?:dataset|datasets)[:/](.+)$/i);
  if (tagMatch?.[1]) return tagMatch[1].trim();

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(text)) return text;
  if (/^[A-Za-z0-9_.-]+$/.test(text) && text.length >= 2) return text;

  return null;
}

export function normalizeTrainingSources(
  sources: TrainingDatasetSource[] | null | undefined,
  extraTags: string[] = []
): TrainingDatasetSource[] {
  const map = new Map<string, TrainingDatasetSource>();

  const add = (raw: TrainingDatasetSource | string, source = 'import') => {
    const obj: TrainingDatasetSource =
      typeof raw === 'string' ? { name: raw, source } : { ...raw, source: raw.source || source };
    const label = cleanText(String(obj.name || obj.id || obj.dataset_id || ''));
    if (!label || label.length < 2) return;
    // Skip noisy fragments
    if (/^(and|or|the|with|using|from|on)$/i.test(label)) return;
    if (label.length > 200) return;

    const key = label.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        ...obj,
        name: label,
        id: obj.id || obj.dataset_id || extractHfDatasetId(label) || undefined,
        source: obj.source || source,
      });
    }
  };

  for (const s of sources || []) add(s);
  for (const tag of extraTags) {
    const t = String(tag);
    if (/^datasets?:/i.test(t) || /huggingface\.co\/datasets\//i.test(t)) {
      add(t.replace(/^datasets?:/i, ''), 'tag');
    }
  }

  return Array.from(map.values()).slice(0, 40);
}

export async function resolveDatasetSlug(
  client: SqlClient,
  source: TrainingDatasetSource
): Promise<string | null> {
  const name = cleanText(String(source.name || ''));
  const hfId =
    extractHfDatasetId(String(source.id || source.dataset_id || '')) ||
    extractHfDatasetId(name) ||
    null;

  const candidates: Array<{ sql: string; params: unknown[] }> = [];

  if (hfId) {
    candidates.push({
      sql: `SELECT slug FROM datasets
            WHERE external_dataset_id = $1
               OR external_dataset_id = $2
               OR lower(slug) = lower($3)
               OR lower(slug) = lower($4)
            LIMIT 1`,
      params: [`hf:${hfId}`, hfId, hfId, hfId.replace(/\//g, '-')],
    });
  }

  if (name) {
    const slugish = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    candidates.push({
      sql: `SELECT slug FROM datasets
            WHERE lower(name) = lower($1)
               OR lower(slug) = lower($1)
               OR lower(slug) = lower($2)
               OR lower(replace(external_dataset_id, 'hf:', '')) = lower($1)
            LIMIT 1`,
      params: [name, slugish],
    });
  }

  for (const c of candidates) {
    try {
      const res = await client.query(c.sql, c.params);
      const slug = res.rows[0]?.slug;
      if (typeof slug === 'string' && slug) return slug;
    } catch {
      /* column may be missing on older DBs */
    }
  }
  return null;
}

/**
 * Upsert model_training_data rows from HF sources and set related_dataset_slug when resolvable.
 */
export async function syncModelTrainingDatasetLinks(
  client: SqlClient,
  modelId: string,
  sources: TrainingDatasetSource[] | null | undefined,
  tags: string[] = []
): Promise<{ linked: LinkedTrainingRow[]; linkedCount: number }> {
  const normalized = normalizeTrainingSources(sources, tags);
  const linked: LinkedTrainingRow[] = [];
  let linkedCount = 0;

  for (const source of normalized) {
    const datasetName = String(source.name);
    const relatedSlug = await resolveDatasetSlug(client, source);
    const downloadUrl =
      source.url ||
      (source.id || source.dataset_id
        ? `https://huggingface.co/datasets/${source.id || source.dataset_id}`
        : extractHfDatasetId(datasetName)
          ? `https://huggingface.co/datasets/${extractHfDatasetId(datasetName)}`
          : null);

    const existing = await client.query(
      `SELECT id, related_dataset_slug FROM model_training_data
       WHERE model_id = $1 AND lower(dataset_name) = lower($2)
       LIMIT 1`,
      [modelId, datasetName]
    );

    if (existing.rows[0]) {
      const id = String(existing.rows[0].id);
      const already = existing.rows[0].related_dataset_slug as string | null;
      if (relatedSlug && !already) {
        await client.query(
          `UPDATE model_training_data
           SET related_dataset_slug = $1,
               download_url = COALESCE(download_url, $2),
               metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
           WHERE id = $4`,
          [
            relatedSlug,
            downloadUrl,
            JSON.stringify({
              auto_linked: true,
              link_source: source.source || 'import',
              linked_at: new Date().toISOString(),
            }),
            id,
          ]
        );
        linkedCount += 1;
        linked.push({ dataset_name: datasetName, related_dataset_slug: relatedSlug, created: false, linked: true });
      } else {
        linked.push({
          dataset_name: datasetName,
          related_dataset_slug: already || relatedSlug,
          created: false,
          linked: Boolean(already || relatedSlug),
        });
        if (already || relatedSlug) linkedCount += 1;
      }
      continue;
    }

    await client.query(
      `INSERT INTO model_training_data (
         model_id, dataset_name, description, dataset_size, license,
         download_url, related_dataset_slug, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        modelId,
        datasetName,
        source.description || null,
        source.size || source.token_count || null,
        source.license || null,
        downloadUrl,
        relatedSlug,
        JSON.stringify({
          source: source.source || 'hf_import',
          auto_linked: Boolean(relatedSlug),
          hf_id: source.id || source.dataset_id || extractHfDatasetId(datasetName),
          linked_at: relatedSlug ? new Date().toISOString() : null,
        }),
      ]
    );

    if (relatedSlug) linkedCount += 1;
    linked.push({
      dataset_name: datasetName,
      related_dataset_slug: relatedSlug,
      created: true,
      linked: Boolean(relatedSlug),
    });
  }

  return { linked, linkedCount };
}

/**
 * When a dataset is imported, attach it to existing training rows that mention it.
 */
export async function linkDatasetToMatchingModels(
  client: SqlClient,
  dataset: {
    slug: string;
    name: string;
    external_dataset_id?: string | null;
  }
): Promise<number> {
  const slug = dataset.slug;
  const name = dataset.name;
  const hfId = String(dataset.external_dataset_id || '')
    .replace(/^hf:/i, '')
    .trim();

  const result = await client.query(
    `UPDATE model_training_data td
     SET related_dataset_slug = $1,
         metadata = COALESCE(td.metadata, '{}'::jsonb) || $5::jsonb
     WHERE td.related_dataset_slug IS NULL
       AND (
         lower(td.dataset_name) = lower($2)
         OR lower(td.dataset_name) = lower($3)
         OR ($4 <> '' AND (
              lower(td.dataset_name) = lower($4)
              OR lower(td.dataset_name) = lower('datasets/' || $4)
              OR lower(td.dataset_name) LIKE lower('%huggingface.co/datasets/' || $4 || '%')
            ))
       )
     RETURNING td.id`,
    [
      slug,
      name,
      slug,
      hfId,
      JSON.stringify({
        auto_linked: true,
        link_source: 'dataset_import',
        linked_at: new Date().toISOString(),
      }),
    ]
  );

  return result.rows.length;
}

/** Conservative backfill for existing catalog rows. */
export async function backfillTrainingDatasetLinks(client: SqlClient): Promise<number> {
  const result = await client.query(
    `UPDATE model_training_data td
     SET related_dataset_slug = d.slug,
         metadata = COALESCE(td.metadata, '{}'::jsonb) || '{"auto_linked":true,"link_source":"backfill"}'::jsonb
     FROM datasets d
     WHERE td.related_dataset_slug IS NULL
       AND (
         lower(td.dataset_name) = lower(d.name)
         OR lower(td.dataset_name) = lower(d.slug)
         OR lower(td.dataset_name) = lower(replace(COALESCE(d.external_dataset_id, ''), 'hf:', ''))
       )
     RETURNING td.id`
  );
  return result.rows.length;
}
