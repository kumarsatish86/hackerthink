/**
 * Backfill size / rows / languages / license / etc. for HF-imported datasets.
 * Usage: node scripts/backfill-dataset-stats.mjs [--limit=20] [--slug=openai-gsm8k]
 */
import { Pool } from 'pg';
import { loadCliEnv, logDbTarget } from './load-cli-env.mjs';

loadCliEnv();
logDbTarget();

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const slugArg = args.find((a) => a.startsWith('--slug='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 50;
const onlySlug = slugArg ? slugArg.split('=')[1] : null;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

function formatByteSize(bytes) {
  if (bytes == null || !Number.isFinite(Number(bytes)) || Number(bytes) <= 0) return null;
  const n = Number(bytes);
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} KB`;
  return `${Math.round(n)} B`;
}

function tagValue(tags, prefix) {
  for (const t of tags || []) {
    const s = String(t);
    if (s.toLowerCase().startsWith(prefix.toLowerCase())) return s.slice(prefix.length).trim() || null;
  }
  return null;
}

function tagValues(tags, prefix) {
  const out = [];
  for (const t of tags || []) {
    const s = String(t);
    if (s.toLowerCase().startsWith(prefix.toLowerCase())) {
      const v = s.slice(prefix.length).trim();
      if (v) out.push(v);
    }
  }
  return [...new Set(out)];
}

function asArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') return [v];
  return [];
}

function extractClassCount(features) {
  if (!Array.isArray(features)) return null;
  for (const f of features) {
    const dtype = f?.dtype ?? f?.type ?? f;
    if (dtype && typeof dtype === 'object') {
      const names = dtype.class_label?.names ?? dtype.names;
      if (Array.isArray(names) && names.length) return names.length;
      if (names && typeof names === 'object') return Object.keys(names).length;
    }
  }
  return null;
}

function fromCardInfo(datasetInfo) {
  const infos = Array.isArray(datasetInfo)
    ? datasetInfo
    : datasetInfo && typeof datasetInfo === 'object'
      ? Object.values(datasetInfo)
      : [];
  let rows = 0;
  let bytes = 0;
  let columns = null;
  let classes = null;
  let saw = false;
  for (const item of infos) {
    if (!item || typeof item !== 'object') continue;
    if (columns == null && Array.isArray(item.features)) columns = item.features.length;
    if (classes == null) classes = extractClassCount(item.features);
    for (const split of item.splits || []) {
      const n = Number(split?.num_examples);
      if (Number.isFinite(n)) {
        rows += n;
        saw = true;
      }
      const b = Number(split?.num_bytes);
      if (Number.isFinite(b)) bytes += b;
    }
    const ds = Number(item.dataset_size ?? item.download_size);
    if (Number.isFinite(ds) && ds > bytes) bytes = ds;
  }
  return { rows: saw ? rows : null, columns, classes, bytes: bytes > 0 ? bytes : null };
}

async function enrichOne(hfId, apiKey) {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const [metaRes, sizeRes] = await Promise.all([
    fetch(`https://huggingface.co/api/datasets/${hfId}`, { headers }),
    fetch(`https://datasets-server.huggingface.co/size?dataset=${encodeURIComponent(hfId)}`, {
      headers,
    }),
  ]);
  if (!metaRes.ok) throw new Error(`HF meta ${metaRes.status}`);
  const data = await metaRes.json();
  const sizePayload = sizeRes.ok ? await sizeRes.json() : null;
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const card = data.cardData || data.card_data || {};
  const fromCard = fromCardInfo(card.dataset_info);
  const sizeBlock = sizePayload?.size?.dataset || {};
  const configs = sizePayload?.size?.configs || [];
  const rowsRaw = Number(sizeBlock.num_rows) || fromCard.rows;
  const bytes =
    Number(sizeBlock.num_bytes_parquet_files) ||
    Number(sizeBlock.num_bytes_original_files) ||
    Number(data.usedStorage) ||
    fromCard.bytes;
  const rows =
    rowsRaw && Number.isFinite(rowsRaw) && rowsRaw > 0 && rowsRaw <= 50_000_000_000 && !(bytes > 0 && rowsRaw > bytes)
      ? Math.round(rowsRaw)
      : null;
  const columns =
    configs.map((c) => Number(c.num_columns)).find((n) => Number.isFinite(n) && n > 0) ??
    fromCard.columns;
  const languages = [
    ...new Set([...tagValues(tags, 'language:'), ...asArr(card.language), ...asArr(card.languages)]),
  ];
  const sizeCategory = tagValue(tags, 'size_categories:') || asArr(card.size_categories)[0] || null;
  return {
    size: formatByteSize(bytes) || sizeCategory,
    rows: rows && Number.isFinite(rows) ? Math.round(rows) : null,
    columns: columns && Number.isFinite(columns) ? Math.round(columns) : null,
    classes: fromCard.classes,
    languages,
    language: languages[0] || null,
    license: tagValue(tags, 'license:') || asArr(card.license)[0] || null,
    format: tagValue(tags, 'format:') || null,
    modality: tagValue(tags, 'modality:') || tagValue(tags, 'task_categories:') || null,
    dataset_type: tagValue(tags, 'task_categories:') || 'general',
    domain: tagValue(tags, 'region:') || null,
    provider: data.author || hfId.split('/')[0] || null,
    stars_count: Number(data.likes) || null,
    release_date: data.createdAt ? String(data.createdAt).slice(0, 10) : null,
    last_updated: data.lastModified ? String(data.lastModified).slice(0, 10) : null,
    quick_facts: {
      classes: fromCard.classes != null ? String(fromCard.classes) : null,
      columns: columns != null ? String(columns) : null,
      size_category: sizeCategory,
      size_bytes: bytes || null,
      rows: rows || null,
      languages,
      source: 'backfill_hf',
    },
  };
}

function resolveHfId(row) {
  if (row.external_dataset_id?.startsWith('hf:')) return row.external_dataset_id.slice(3);
  if (row.huggingface_url) {
    const m = String(row.huggingface_url).match(/huggingface\.co\/datasets\/([^/?#]+\/[^/?#]+)/i);
    if (m) return m[1];
  }
  if (row.name?.includes('/')) return row.name;
  return null;
}

try {
  const keyRes = await pool.query(
    `SELECT api_key FROM import_settings WHERE source_name = 'huggingface' AND enabled = true LIMIT 1`
  );
  const apiKey = keyRes.rows[0]?.api_key || process.env.HUGGINGFACE_API_KEY || undefined;

  let sql = `
    SELECT id, slug, name, external_dataset_id, huggingface_url, size, rows, languages
    FROM datasets
    WHERE (import_source = 'huggingface' OR external_dataset_id LIKE 'hf:%' OR huggingface_url IS NOT NULL)
  `;
  const params = [];
  if (onlySlug) {
    params.push(onlySlug);
    sql += ` AND slug = $${params.length}`;
  } else {
    sql += ` AND (size IS NULL OR size = '' OR rows IS NULL OR languages IS NULL OR languages = '[]'::jsonb)`;
  }
  sql += ` ORDER BY download_count DESC NULLS LAST LIMIT $${params.length + 1}`;
  params.push(limit);

  const { rows } = await pool.query(sql, params);
  console.log(`Backfilling ${rows.length} datasets…`);

  let ok = 0;
  let fail = 0;
  for (const row of rows) {
    const hfId = resolveHfId(row);
    if (!hfId) {
      console.log('skip (no hf id)', row.slug);
      continue;
    }
    try {
      const e = await enrichOne(hfId, apiKey);
      await pool.query(
        `UPDATE datasets SET
           size = COALESCE($2, size),
           rows = CASE
             WHEN $3::bigint IS NOT NULL THEN $3::bigint
             WHEN rows IS NOT NULL AND rows > 50000000000 THEN NULL
             ELSE rows
           END,
           columns = COALESCE($4, columns),
           languages = CASE WHEN $5::jsonb <> '[]'::jsonb THEN $5::jsonb ELSE languages END,
           language = COALESCE($6, language),
           license = COALESCE($7, license),
           format = COALESCE($8, format),
           modality = COALESCE($9, modality),
           dataset_type = COALESCE($10, dataset_type),
           domain = COALESCE($11, domain),
           provider = COALESCE($12, provider),
           stars_count = COALESCE($13, stars_count),
           release_date = COALESCE($14::date, release_date),
           last_updated = COALESCE($15::timestamptz, last_updated),
           quick_facts = COALESCE(quick_facts, '{}'::jsonb) || $16::jsonb,
           updated_at = NOW()
         WHERE id = $1`,
        [
          row.id,
          e.size,
          e.rows,
          e.columns,
          JSON.stringify(e.languages || []),
          e.language,
          e.license,
          e.format,
          e.modality,
          e.dataset_type,
          e.domain,
          e.provider,
          e.stars_count,
          e.release_date,
          e.last_updated,
          JSON.stringify(e.quick_facts),
        ]
      );
      ok += 1;
      console.log('ok', row.slug, { size: e.size, rows: e.rows, langs: e.languages?.length || 0 });
    } catch (err) {
      fail += 1;
      console.error('fail', row.slug, err.message);
    }
  }
  console.log(`Done. updated=${ok} failed=${fail}`);
} finally {
  await pool.end();
}
