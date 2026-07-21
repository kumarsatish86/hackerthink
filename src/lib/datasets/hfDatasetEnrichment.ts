/**
 * Parse Hugging Face dataset API + datasets-server payloads into catalog fields.
 */

export type HfDatasetEnrichment = {
  size: string | null;
  size_bytes: number | null;
  rows: number | null;
  columns: number | null;
  classes: number | null;
  languages: string[];
  language: string | null;
  license: string | null;
  format: string | null;
  modality: string | null;
  dataset_type: string | null;
  domain: string | null;
  provider: string | null;
  stars_count: number | null;
  release_date: string | null;
  last_updated: string | null;
  quick_facts: Record<string, unknown>;
};

function tagValue(tags: string[], prefix: string): string | null {
  const p = prefix.toLowerCase();
  for (const t of tags) {
    const s = String(t);
    if (s.toLowerCase().startsWith(p)) {
      return s.slice(prefix.length).trim() || null;
    }
  }
  return null;
}

function tagValues(tags: string[], prefix: string): string[] {
  const p = prefix.toLowerCase();
  const out: string[] = [];
  for (const t of tags) {
    const s = String(t);
    if (s.toLowerCase().startsWith(p)) {
      const v = s.slice(prefix.length).trim();
      if (v) out.push(v);
    }
  }
  return Array.from(new Set(out));
}

export function formatByteSize(bytes: number | null | undefined): string | null {
  if (bytes == null || !Number.isFinite(Number(bytes)) || Number(bytes) <= 0) return null;
  const n = Number(bytes);
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} KB`;
  return `${Math.round(n)} B`;
}

/** Drop absurd HF row totals (token counts / bad estimates). */
export function sanitizeRowCount(
  rows: number | null | undefined,
  sizeBytes?: number | null
): number | null {
  if (rows == null || !Number.isFinite(Number(rows)) || Number(rows) <= 0) return null;
  const n = Math.round(Number(rows));
  if (n > 50_000_000_000) return null;
  if (sizeBytes != null && sizeBytes > 0 && n > sizeBytes) return null;
  return n;
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return [value];
  return [];
}

function extractClassCount(features: unknown): number | null {
  if (!Array.isArray(features)) return null;
  for (const raw of features) {
    const f = raw as Record<string, unknown>;
    const dtype = (f?.dtype ?? f?.type ?? f) as Record<string, unknown> | string;
    if (dtype && typeof dtype === 'object') {
      const classLabel = (dtype.class_label || dtype.ClassLabel || dtype) as Record<string, unknown>;
      const names = classLabel?.names ?? (dtype as { names?: unknown }).names;
      if (Array.isArray(names) && names.length) return names.length;
      if (names && typeof names === 'object') return Object.keys(names as object).length;
      if (String((dtype as { _type?: string })._type || '').toLowerCase() === 'classlabel') {
        const n = (dtype as { names?: unknown }).names;
        if (Array.isArray(n)) return n.length;
        if (n && typeof n === 'object') return Object.keys(n as object).length;
      }
    }
  }
  return null;
}

function sumExamplesFromCardInfo(datasetInfo: unknown): {
  rows: number | null;
  columns: number | null;
  classes: number | null;
  bytes: number | null;
} {
  const infos = Array.isArray(datasetInfo)
    ? datasetInfo
    : datasetInfo && typeof datasetInfo === 'object'
      ? Object.values(datasetInfo as object)
      : [];

  let rows = 0;
  let bytes = 0;
  let columns: number | null = null;
  let classes: number | null = null;
  let sawRows = false;

  for (const info of infos) {
    const item = info as Record<string, unknown>;
    if (!item || typeof item !== 'object') continue;
    const features = item.features;
    if (columns == null && Array.isArray(features)) columns = features.length;
    if (classes == null) classes = extractClassCount(features);

    const splits = item.splits;
    if (Array.isArray(splits)) {
      for (const split of splits) {
        const n = Number((split as { num_examples?: number })?.num_examples);
        if (Number.isFinite(n)) {
          rows += n;
          sawRows = true;
        }
        const b = Number((split as { num_bytes?: number })?.num_bytes);
        if (Number.isFinite(b)) bytes += b;
      }
    }
    const ds = Number(item.dataset_size ?? item.download_size);
    if (Number.isFinite(ds) && ds > bytes) bytes = ds;
  }

  return {
    rows: sawRows ? rows : null,
    columns,
    classes,
    bytes: bytes > 0 ? bytes : null,
  };
}

export function buildHfDatasetEnrichment(
  data: Record<string, unknown>,
  sizePayload?: Record<string, unknown> | null
): HfDatasetEnrichment {
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const card = (data.cardData || data.card_data || {}) as Record<string, unknown>;
  const id = String(data.id || '');
  const author = String(data.author || id.split('/')[0] || 'HuggingFace');

  const fromCard = sumExamplesFromCardInfo(card.dataset_info);
  const sizeBlock = (sizePayload?.size as Record<string, unknown> | undefined)?.dataset as
    | Record<string, unknown>
    | undefined;
  const configs = ((sizePayload?.size as Record<string, unknown> | undefined)?.configs ||
    []) as Record<string, unknown>[];

  const rowsFromServer =
    Number(sizeBlock?.num_rows) ||
    Number(sizeBlock?.estimated_num_rows) ||
    null;
  const bytesFromServer =
    Number(sizeBlock?.num_bytes_parquet_files) ||
    Number(sizeBlock?.num_bytes_original_files) ||
    Number(sizeBlock?.num_bytes_memory) ||
    Number(data.usedStorage) ||
    null;
  const columnsFromServer =
    configs.map((c) => Number(c.num_columns)).find((n) => Number.isFinite(n) && n > 0) ?? null;

  const rowsRaw = rowsFromServer || fromCard.rows;
  const sizeBytes = bytesFromServer || fromCard.bytes;
  const columns = columnsFromServer || fromCard.columns;
  const classes = fromCard.classes;
  const rows = sanitizeRowCount(rowsRaw, sizeBytes);

  const languages = Array.from(
    new Set([
      ...tagValues(tags, 'language:'),
      ...asStringArray(card.language),
      ...asStringArray(card.languages),
    ])
  ).filter((l) => l && l.toLowerCase() !== 'code');

  const sizeCategory =
    tagValue(tags, 'size_categories:') ||
    asStringArray(card.size_categories)[0] ||
    null;

  const size =
    formatByteSize(sizeBytes) ||
    (sizeCategory ? sizeCategory.replace(/</g, '<') : null);

  const licenseRaw =
    tagValue(tags, 'license:') ||
    asStringArray(card.license)[0] ||
    (typeof data.license === 'string' ? data.license : null);

  const format =
    tagValue(tags, 'format:') || asStringArray(card.format)[0] || null;
  const modality =
    tagValue(tags, 'modality:') ||
    asStringArray(card.modality)[0] ||
    tagValue(tags, 'task_categories:') ||
    asStringArray(card.task_categories)[0] ||
    null;
  const datasetType =
    tagValue(tags, 'task_categories:') ||
    asStringArray(card.task_categories)[0] ||
    modality ||
    'general';
  const domain =
    tagValue(tags, 'region:') ||
    asStringArray(card.domain)[0] ||
    null;

  return {
    size,
    size_bytes: sizeBytes,
    rows: rows && Number.isFinite(rows) ? Math.round(rows) : null,
    columns: columns && Number.isFinite(columns) ? Math.round(columns) : null,
    classes: classes && Number.isFinite(classes) ? Math.round(classes) : null,
    languages,
    language: languages[0] || null,
    license: licenseRaw,
    format,
    modality,
    dataset_type: datasetType,
    domain,
    provider: author || 'HuggingFace',
    stars_count: Number(data.likes) || null,
    release_date: data.createdAt ? String(data.createdAt).slice(0, 10) : null,
    last_updated: data.lastModified ? String(data.lastModified).slice(0, 10) : null,
    quick_facts: {
      classes: classes != null ? String(classes) : null,
      columns: columns != null ? String(columns) : null,
      size_category: sizeCategory,
      size_bytes: sizeBytes,
      rows,
      languages,
      format,
      modality,
      source: 'huggingface',
    },
  };
}

/** Fetch datasets-server size summary (best-effort). */
export async function fetchHfDatasetSize(
  datasetId: string,
  apiKey?: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `https://datasets-server.huggingface.co/size?dataset=${encodeURIComponent(datasetId)}`,
      {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
