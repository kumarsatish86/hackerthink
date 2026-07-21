import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseJsonField(field: unknown) {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

type FacetCount = { value: string; count: number };

function rowsToFacets(rows: { value: string; count: string | number }[]): FacetCount[] {
  return rows
    .filter((r) => r.value)
    .map((r) => ({ value: String(r.value), count: Number(r.count) || 0 }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function splitCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((v) => v.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';
    const datasetType = searchParams.get('dataset_type');
    const modality = searchParams.get('modality');
    const domain = searchParams.get('domain');
    const format = searchParams.get('format');
    const license = searchParams.get('license');
    const language = searchParams.get('language');
    const organization = searchParams.get('organization');
    const year = searchParams.get('year');
    const ethics = searchParams.get('ethics'); // pii | high_risk | commercial (comma-separated ok)
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sort') || 'downloads';
    const sortOrder = searchParams.get('order') || 'desc';

    const where: string[] = ['status = $1'];
    const params: unknown[] = [status];
    let paramIndex = 2;

    if (search) {
      where.push(
        `(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR provider ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const types = splitCsv(datasetType);
    if (types.length === 1) {
      where.push(
        `(dataset_type = $${paramIndex} OR dataset_type ILIKE $${paramIndex + 1} OR COALESCE(modality, '') ILIKE $${paramIndex + 1} OR COALESCE(domain, '') ILIKE $${paramIndex + 1})`
      );
      params.push(types[0], `%${types[0]}%`);
      paramIndex += 2;
    } else if (types.length > 1) {
      where.push(`(
        dataset_type = ANY($${paramIndex}::text[])
        OR EXISTS (
          SELECT 1 FROM unnest($${paramIndex}::text[]) t
          WHERE dataset_type ILIKE '%' || t || '%'
             OR COALESCE(modality, '') ILIKE '%' || t || '%'
             OR COALESCE(domain, '') ILIKE '%' || t || '%'
        )
      )`);
      params.push(types);
      paramIndex++;
    }

    const modalities = splitCsv(modality);
    if (modalities.length > 0) {
      where.push(`EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) m
        WHERE COALESCE(modality, '') ILIKE '%' || m || '%'
           OR COALESCE(dataset_type, '') ILIKE '%' || m || '%'
           OR COALESCE(domain, '') ILIKE '%' || m || '%'
      )`);
      params.push(modalities);
      paramIndex++;
    }

    const domains = splitCsv(domain);
    if (domains.length > 0) {
      where.push(`EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) d
        WHERE COALESCE(domain, '') ILIKE '%' || d || '%'
      )`);
      params.push(domains);
      paramIndex++;
    }

    const formats = splitCsv(format);
    if (formats.length > 0) {
      where.push(`EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) f
        WHERE COALESCE(format, '') ILIKE '%' || f || '%'
      )`);
      params.push(formats);
      paramIndex++;
    }

    const licenses = splitCsv(license);
    if (licenses.length === 1) {
      where.push(`license ILIKE $${paramIndex}`);
      params.push(`%${licenses[0]}%`);
      paramIndex++;
    } else if (licenses.length > 1) {
      where.push(`EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) l
        WHERE license ILIKE '%' || l || '%'
      )`);
      params.push(licenses);
      paramIndex++;
    }

    const languages = splitCsv(language);
    if (languages.length > 0) {
      where.push(`EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) lang
        WHERE COALESCE(language, '') ILIKE '%' || lang || '%'
           OR COALESCE(languages::text, '') ILIKE '%' || lang || '%'
      )`);
      params.push(languages);
      paramIndex++;
    }

    if (organization) {
      where.push(`provider ILIKE $${paramIndex}`);
      params.push(`%${organization}%`);
      paramIndex++;
    }

    if (year) {
      where.push(`EXTRACT(YEAR FROM release_date) = $${paramIndex}`);
      params.push(parseInt(year, 10));
      paramIndex++;
    }

    const ethicsList = splitCsv(ethics);
    for (const flag of ethicsList) {
      if (flag === 'pii') {
        where.push(`pii_present = TRUE`);
      } else if (flag === 'high_risk') {
        where.push(`COALESCE(risk_score, 0) >= 6`);
      } else if (flag === 'commercial') {
        where.push(
          `(commercial_use = TRUE OR license ILIKE '%mit%' OR license ILIKE '%apache%' OR license ILIKE '%cc0%' OR license ILIKE '%cc-by%')`
        );
      }
    }

    if (featured === 'true') {
      where.push(`featured = true`);
    }

    const whereSql = where.join(' AND ');

    const sortMap: Record<string, string> = {
      created_at: 'created_at',
      release_date: 'release_date',
      name: 'name',
      rating: 'rating',
      downloads: 'download_count',
      download_count: 'download_count',
      view_count: 'view_count',
      quality_score: 'quality_score',
      freshness_score: 'freshness_score',
      popularity_score: 'popularity_score',
    };
    const sortColumn = sortMap[sortBy] || 'download_count';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const listSql = `
      SELECT id, name, slug, provider, description, dataset_type, format, size,
        rows, language, languages, domain, license, rating, rating_count,
        download_count, view_count, logo_url, release_date, created_at,
        quality_score, freshness_score, popularity_score, commercial_use,
        storage_estimate, ram_estimate, modality
      FROM datasets
      WHERE ${whereSql}
      ORDER BY ${sortColumn} ${order} NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const listParams = [...params, limit, offset];

    const countSql = `SELECT COUNT(*)::int AS count FROM datasets WHERE ${whereSql}`;

    const [result, countResult, typeFacets, domainFacets, licenseFacets, yearFacets, formatFacets, modalityFacets, orgFacets] =
      await Promise.all([
        query(listSql, listParams),
        query(countSql, params),
        query(
          `SELECT dataset_type AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND dataset_type IS NOT NULL AND dataset_type <> ''
           GROUP BY dataset_type ORDER BY count DESC`,
          [status]
        ),
        query(
          `SELECT domain AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND domain IS NOT NULL AND domain <> ''
           GROUP BY domain ORDER BY count DESC`,
          [status]
        ),
        query(
          `SELECT license AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND license IS NOT NULL AND license <> ''
           GROUP BY license ORDER BY count DESC LIMIT 40`,
          [status]
        ),
        query(
          `SELECT EXTRACT(YEAR FROM release_date)::int::text AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND release_date IS NOT NULL
           GROUP BY 1 ORDER BY 1 DESC`,
          [status]
        ),
        query(
          `SELECT format AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND format IS NOT NULL AND format <> ''
           GROUP BY format ORDER BY count DESC LIMIT 40`,
          [status]
        ),
        query(
          `SELECT modality AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND modality IS NOT NULL AND modality <> ''
           GROUP BY modality ORDER BY count DESC LIMIT 40`,
          [status]
        ),
        query(
          `SELECT provider AS value, COUNT(*)::int AS count FROM datasets
           WHERE status = $1 AND provider IS NOT NULL AND provider <> ''
           GROUP BY provider ORDER BY count DESC LIMIT 50`,
          [status]
        ),
      ]);

    const datasets = (result.rows as Record<string, unknown>[]).map((dataset) => ({
      ...dataset,
      languages: parseJsonField(dataset.languages) || [],
    }));

    const facetCounts = {
      datasetTypes: rowsToFacets(typeFacets.rows as unknown as { value: string; count: number }[]),
      domains: rowsToFacets(domainFacets.rows as unknown as { value: string; count: number }[]),
      licenses: rowsToFacets(licenseFacets.rows as unknown as { value: string; count: number }[]),
      years: rowsToFacets(yearFacets.rows as unknown as { value: string; count: number }[]),
      formats: rowsToFacets(formatFacets.rows as unknown as { value: string; count: number }[]),
      modalities: rowsToFacets(modalityFacets.rows as unknown as { value: string; count: number }[]),
      organizations: rowsToFacets(orgFacets.rows as unknown as { value: string; count: number }[]),
    };

    const filterOptions = {
      datasetTypes: facetCounts.datasetTypes.map((f) => f.value),
      domains: facetCounts.domains.map((f) => f.value),
      licenses: facetCounts.licenses.map((f) => f.value),
      years: facetCounts.years.map((f) => Number(f.value)).filter(Boolean),
      formats: facetCounts.formats.map((f) => f.value),
      modalities: facetCounts.modalities.map((f) => f.value),
      organizations: facetCounts.organizations.map((f) => f.value),
    };

    return NextResponse.json({
      datasets,
      total: countResult.rows[0]?.count ?? 0,
      filterOptions,
      facetCounts,
    });
  } catch (error) {
    console.error('Error fetching public datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets', details: (error as Error).message },
      { status: 500 }
    );
  }
}
