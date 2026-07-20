import { NextRequest, NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

const KNOWN_LIBRARIES = [
  'transformers',
  'diffusers',
  'pytorch',
  'tensorflow',
  'jax',
  'safetensors',
  'gguf',
  'mlx',
  'peft',
  'sentence-transformers',
  'llama.cpp',
  'onnx',
  'timm',
];

function paramSizeToRange(bucket: string): { min: number | null; max: number | null } {
  switch (bucket) {
    case '<1':
      return { min: 0, max: 1 };
    case '1-8':
      return { min: 1, max: 8 };
    case '8-13':
      return { min: 8, max: 13 };
    case '13-30':
      return { min: 13, max: 30 };
    case '30-120':
      return { min: 30, max: 120 };
    case '>120':
      return { min: 120, max: null };
    default:
      return { min: null, max: null };
  }
}

// Approximate parameter size in billions from strings like "7B", "70B", "110M"
const PARAM_SIZE_SQL = `
  COALESCE(
    param_count_b::float,
    CASE
      WHEN parameters ~* '([0-9]+(?:\\.[0-9]+)?)\\s*[Bb]' THEN
        (regexp_match(parameters, '([0-9]+(?:\\.[0-9]+)?)\\s*[Bb]', 'i'))[1]::float
      WHEN parameters ~* '([0-9]+(?:\\.[0-9]+)?)\\s*[Mm]' THEN
        (regexp_match(parameters, '([0-9]+(?:\\.[0-9]+)?)\\s*[Mm]', 'i'))[1]::float / 1000.0
      WHEN parameters ~* '([0-9]+(?:\\.[0-9]+)?)\\s*[Kk]' THEN
        (regexp_match(parameters, '([0-9]+(?:\\.[0-9]+)?)\\s*[Kk]', 'i'))[1]::float / 1000000.0
      ELSE NULL
    END
  )
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const search = searchParams.get('search') || '';
    const modelType = searchParams.get('model_type'); // comma-separated
    const license = searchParams.get('license'); // comma-separated
    const organization = searchParams.get('organization');
    const library = searchParams.get('library'); // comma-separated tag match
    const architecture = searchParams.get('architecture');
    const paramSize = searchParams.get('param_size'); // legacy bucket
    const minParamsB = searchParams.get('min_params_b');
    const maxParamsB = searchParams.get('max_params_b');
    const language = searchParams.get('language');
    const modelTree = searchParams.get('model_tree');
    const app = searchParams.get('app');
    const provider = searchParams.get('provider');
    const misc = searchParams.get('misc');
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';
    const featured = searchParams.get('featured');

    let query = `
      SELECT 
        id, name, slug, developer, description, model_type, task, framework,
        parameters, param_count_b, context_length, architecture, license, 
        rating, rating_count, download_count, view_count, likes_count,
        logo_url, created_at, status, featured, tags, categories, verified
      FROM ai_models 
      WHERE status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    if (search) {
      query += ` AND (
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        developer ILIKE $${paramIndex} OR
        slug ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (modelType) {
      const types = modelType.split(',').map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) {
        query += ` AND (
          model_type = $${paramIndex}
          OR model_type ILIKE $${paramIndex + 1}
          OR COALESCE(tags::text, '') ILIKE $${paramIndex + 1}
          OR COALESCE(categories::text, '') ILIKE $${paramIndex + 1}
        )`;
        params.push(types[0], `%${types[0]}%`);
        paramIndex += 2;
      } else if (types.length > 1) {
        query += ` AND (
          model_type = ANY($${paramIndex}::text[])
          OR EXISTS (
            SELECT 1 FROM unnest($${paramIndex}::text[]) t
            WHERE model_type ILIKE '%' || t || '%'
               OR COALESCE(tags::text, '') ILIKE '%' || t || '%'
               OR COALESCE(categories::text, '') ILIKE '%' || t || '%'
          )
        )`;
        params.push(types);
        paramIndex++;
      }
    }

    if (license) {
      const licenses = license.split(',').map((l) => l.trim()).filter(Boolean);
      if (licenses.length === 1) {
        query += ` AND license ILIKE $${paramIndex}`;
        params.push(`%${licenses[0]}%`);
        paramIndex++;
      } else if (licenses.length > 1) {
        query += ` AND EXISTS (
          SELECT 1 FROM unnest($${paramIndex}::text[]) l
          WHERE license ILIKE '%' || l || '%'
        )`;
        params.push(licenses);
        paramIndex++;
      }
    }

    if (organization) {
      query += ` AND developer ILIKE $${paramIndex}`;
      params.push(`%${organization}%`);
      paramIndex++;
    }

    if (architecture) {
      query += ` AND architecture ILIKE $${paramIndex}`;
      params.push(`%${architecture}%`);
      paramIndex++;
    }

    if (library) {
      const libraries = library.split(',').map((l) => l.trim().toLowerCase()).filter(Boolean);
      if (libraries.length > 0) {
        query += ` AND EXISTS (
          SELECT 1 FROM unnest($${paramIndex}::text[]) lib
          WHERE COALESCE(tags::text, '') ILIKE '%' || lib || '%'
             OR COALESCE(categories::text, '') ILIKE '%' || lib || '%'
             OR COALESCE(architecture, '') ILIKE '%' || lib || '%'
        )`;
        params.push(libraries);
        paramIndex++;
      }
    }

    if (featured === 'true') {
      query += ` AND featured = true`;
    }

    const addTagFilter = (raw: string | null) => {
      if (!raw) return;
      const values = raw.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
      if (!values.length) return;
      query += ` AND EXISTS (
        SELECT 1 FROM unnest($${paramIndex}::text[]) v
        WHERE COALESCE(tags::text, '') ILIKE '%' || v || '%'
           OR COALESCE(categories::text, '') ILIKE '%' || v || '%'
      )`;
      params.push(values);
      paramIndex++;
    };

    addTagFilter(language);
    addTagFilter(modelTree);
    addTagFilter(app);
    addTagFilter(provider);
    addTagFilter(misc);

    // Dual-handle slider params (billions)
    if (minParamsB !== null && minParamsB !== '' && !Number.isNaN(Number(minParamsB))) {
      query += ` AND (${PARAM_SIZE_SQL}) >= $${paramIndex}`;
      params.push(Number(minParamsB));
      paramIndex++;
    }
    if (maxParamsB !== null && maxParamsB !== '' && !Number.isNaN(Number(maxParamsB))) {
      query += ` AND (${PARAM_SIZE_SQL}) <= $${paramIndex}`;
      params.push(Number(maxParamsB));
      paramIndex++;
    } else if (paramSize) {
      const { min, max } = paramSizeToRange(paramSize);
      if (min !== null) {
        query += ` AND (${PARAM_SIZE_SQL}) >= $${paramIndex}`;
        params.push(min);
        paramIndex++;
      }
      if (max !== null) {
        query += ` AND (${PARAM_SIZE_SQL}) < $${paramIndex}`;
        params.push(max);
        paramIndex++;
      }
    }

    const validSortFields: Record<string, string> = {
      created_at: 'created_at',
      rating: 'rating',
      downloads: 'download_count',
      download_count: 'download_count',
      name: 'name',
      parameters: 'parameters',
      trending: 'download_count',
    };

    const sortField = validSortFields[sortBy] || 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order} NULLS LAST`;
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await dbQuery(query, params);

    // Filter facet options
    let filterOptions: any = {
      modelTypes: [],
      licenses: [],
      organizations: [],
      libraries: [],
      architectures: [],
      paramSizes: ['<1', '1-8', '8-13', '13-30', '30-120', '>120'],
    };

    try {
      const [types, licenses, orgs, arches, tagRows] = await Promise.all([
        dbQuery(
          `SELECT DISTINCT model_type FROM ai_models WHERE status = $1 AND model_type IS NOT NULL AND model_type <> '' ORDER BY model_type`,
          [status]
        ),
        dbQuery(
          `SELECT DISTINCT license FROM ai_models WHERE status = $1 AND license IS NOT NULL AND license <> '' ORDER BY license`,
          [status]
        ),
        dbQuery(
          `SELECT DISTINCT developer FROM ai_models WHERE status = $1 AND developer IS NOT NULL AND developer <> '' ORDER BY developer LIMIT 50`,
          [status]
        ),
        dbQuery(
          `SELECT DISTINCT architecture FROM ai_models WHERE status = $1 AND architecture IS NOT NULL AND architecture <> '' ORDER BY architecture LIMIT 40`,
          [status]
        ),
        dbQuery(
          `SELECT tags FROM ai_models WHERE status = $1 AND tags IS NOT NULL`,
          [status]
        ),
      ]);

      const tagCounts = new Map<string, number>();
      for (const row of tagRows.rows) {
        let tags = row.tags;
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch {
            tags = [];
          }
        }
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            const key = String(tag).toLowerCase();
            tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
          }
        }
      }

      const libraries = KNOWN_LIBRARIES.filter((lib) => (tagCounts.get(lib) || 0) > 0);
      // Also surface frequent non-library tags that look like tasks
      const extraTags = Array.from(tagCounts.entries())
        .filter(([tag, count]) => count >= 1 && !KNOWN_LIBRARIES.includes(tag))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([tag]) => tag);

      filterOptions = {
        modelTypes: types.rows.map((r: any) => r.model_type).filter(Boolean),
        licenses: licenses.rows.map((r: any) => r.license).filter(Boolean),
        organizations: orgs.rows.map((r: any) => r.developer).filter(Boolean),
        libraries: libraries.length > 0 ? libraries : KNOWN_LIBRARIES.slice(0, 8),
        architectures: arches.rows.map((r: any) => r.architecture).filter(Boolean),
        tags: extraTags,
        paramSizes: ['<1', '1-8', '8-13', '13-30', '30-120', '>120'],
      };
    } catch (filterError) {
      console.error('Error fetching filter options:', filterError);
    }

    return NextResponse.json({
      models: result.rows,
      total: result.rows.length,
      filterOptions,
    });
  } catch (error) {
    console.error('Error fetching public models:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch models',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
