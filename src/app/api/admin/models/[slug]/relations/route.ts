import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'admin' && role !== 'superadmin')) {
    return null;
  }
  return session;
}

interface RelationConfig {
  table: string;
  columns: string[];
  jsonColumns?: string[];
  orderBy: string;
}

// Generic CRUD surface for every satellite table that backs the admin docs
// editor's tabs (FAQs, Install, Usage, Papers, Security, Relations, ...).
// Select the table via `?type=`, e.g. `/relations?type=faqs`.
const RELATIONS: Record<string, RelationConfig> = {
  faqs: {
    table: 'model_faqs',
    columns: ['question', 'answer', 'sort_order'],
    orderBy: 'sort_order, question',
  },
  install_guides: {
    table: 'model_install_guides',
    columns: ['target', 'title', 'command', 'code', 'description', 'version_label', 'sort_order'],
    orderBy: 'sort_order, target',
  },
  usage_examples: {
    table: 'model_usage_examples',
    columns: ['title', 'language', 'runtime', 'code', 'description', 'sort_order'],
    orderBy: 'sort_order, title',
  },
  papers: {
    table: 'model_papers',
    columns: ['title', 'authors', 'conference', 'published_at', 'url', 'bibtex', 'paper_type'],
    orderBy: 'published_at DESC NULLS LAST, title',
  },
  security_notes: {
    table: 'model_security_notes',
    columns: ['note_type', 'title', 'body', 'severity'],
    orderBy: 'created_at DESC',
  },
  benchmarks: {
    table: 'model_benchmarks',
    columns: ['benchmark_name', 'score', 'metric', 'dataset', 'evaluated_at', 'source_url', 'notes'],
    orderBy: 'benchmark_name',
  },
  variants: {
    table: 'model_variants',
    columns: ['name', 'variant_type', 'parameters', 'quantization', 'notes', 'sort_order', 'variant_model_id'],
    orderBy: 'sort_order, name',
  },
  comparisons: {
    table: 'model_comparisons',
    columns: ['peer_model_id', 'peer_slug', 'notes', 'sort_order'],
    orderBy: 'sort_order',
  },
  community_links: {
    table: 'model_community_links',
    columns: ['title', 'url', 'link_type'],
    orderBy: 'title',
  },
  architecture_nodes: {
    table: 'model_architecture_nodes',
    columns: ['node_key', 'title', 'explanation', 'sort_order', 'metadata'],
    jsonColumns: ['metadata'],
    orderBy: 'sort_order, title',
  },
  use_case_cards: {
    table: 'model_use_case_cards',
    columns: ['industry', 'title', 'description', 'sort_order'],
    orderBy: 'sort_order, industry',
  },
  api_docs: {
    table: 'model_api_docs',
    columns: ['doc_type', 'title', 'content', 'code', 'language', 'metadata', 'sort_order'],
    jsonColumns: ['metadata'],
    orderBy: 'sort_order, doc_type',
  },
  tutorials: {
    table: 'model_tutorials',
    columns: ['title', 'difficulty', 'url', 'description', 'is_video', 'sort_order'],
    orderBy: 'sort_order, title',
  },
};

function getConfig(type: string | null): RelationConfig | null {
  if (!type) return null;
  return RELATIONS[type] || null;
}

async function getModelId(slug: string): Promise<string | undefined> {
  const row = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
  return row?.id as string | undefined;
}

function prepareValue(config: RelationConfig, column: string, value: any) {
  if (config.jsonColumns?.includes(column)) {
    if (value === undefined || value === null || value === '') return '{}';
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  return value === undefined ? null : value;
}

function invalidTypeResponse(type: string | null) {
  return NextResponse.json(
    { error: `Unknown or missing relation type "${type}"`, available: Object.keys(RELATIONS) },
    { status: 400 }
  );
}

// GET list rows for a relation type belonging to a model
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const type = request.nextUrl.searchParams.get('type');
    const config = getConfig(type);
    if (!config) return invalidTypeResponse(type);

    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    let sql = `SELECT * FROM ${config.table} WHERE model_id = $1 ORDER BY ${config.orderBy}`;
    if (type === 'comparisons') {
      sql = `SELECT c.*, m.name AS peer_name, m.slug AS resolved_slug
             FROM model_comparisons c LEFT JOIN ai_models m ON m.id = c.peer_model_id
             WHERE c.model_id = $1 ORDER BY c.sort_order`;
    } else if (type === 'variants') {
      sql = `SELECT v.*, m.slug AS variant_slug
             FROM model_variants v LEFT JOIN ai_models m ON m.id = v.variant_model_id
             WHERE v.model_id = $1 ORDER BY v.sort_order, v.name`;
    }

    const result = await query(sql, [modelId]);
    return NextResponse.json({ type, rows: result.rows });
  } catch (error: any) {
    console.error('Error fetching relation rows:', error);
    return NextResponse.json({ error: 'Failed to fetch relation rows', details: error?.message }, { status: 500 });
  }
}

// POST create a relation row
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const type = request.nextUrl.searchParams.get('type');
    const config = getConfig(type);
    if (!config) return invalidTypeResponse(type);

    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const body = await request.json();

    if (type === 'comparisons' && body.peer_slug && !body.peer_model_id) {
      const peer = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [body.peer_slug]);
      if (peer) body.peer_model_id = (peer as any).id;
    }

    const columns = ['model_id', ...config.columns];
    const values = [modelId, ...config.columns.map((c) => prepareValue(config, c, body[c]))];
    const placeholders = columns.map((col, i) =>
      config.jsonColumns?.includes(col) ? `$${i + 1}::jsonb` : `$${i + 1}`
    );

    const inserted = await queryOne(
      `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );

    return NextResponse.json({ row: inserted }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating relation row:', error);
    return NextResponse.json({ error: 'Failed to create relation row', details: error?.message }, { status: 500 });
  }
}

// PUT update a relation row (expects `id` in the body)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const type = request.nextUrl.searchParams.get('type');
    const config = getConfig(type);
    if (!config) return invalidTypeResponse(type);

    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (type === 'comparisons' && fields.peer_slug && !fields.peer_model_id) {
      const peer = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [fields.peer_slug]);
      if (peer) fields.peer_model_id = (peer as any).id;
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const column of config.columns) {
      if (!(column in fields)) continue;
      const value = prepareValue(config, column, fields[column]);
      setClauses.push(config.jsonColumns?.includes(column) ? `${column} = $${idx}::jsonb` : `${column} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    values.push(id, modelId);
    const updated = await queryOne(
      `UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE id = $${idx} AND model_id = $${idx + 1} RETURNING *`,
      values
    );

    if (!updated) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    return NextResponse.json({ row: updated });
  } catch (error: any) {
    console.error('Error updating relation row:', error);
    return NextResponse.json({ error: 'Failed to update relation row', details: error?.message }, { status: 500 });
  }
}

// DELETE a relation row (expects `id` as a query parameter)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const type = request.nextUrl.searchParams.get('type');
    const id = request.nextUrl.searchParams.get('id');
    const config = getConfig(type);
    if (!config) return invalidTypeResponse(type);
    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const result = await query(
      `DELETE FROM ${config.table} WHERE id = $1 AND model_id = $2 RETURNING id`,
      [id, modelId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted', id });
  } catch (error: any) {
    console.error('Error deleting relation row:', error);
    return NextResponse.json({ error: 'Failed to delete relation row', details: error?.message }, { status: 500 });
  }
}
