import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function ensurePublishedColumn() {
  await pool.query(`
    ALTER TABLE glossary_terms
    ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true
  `);
}

function parseTermId(id: string): number | null {
  const termId = parseInt(id, 10);
  return Number.isNaN(termId) ? null : termId;
}

// GET /api/admin/terms/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const termId = parseTermId(id);
    if (termId === null) {
      return NextResponse.json({ message: 'Invalid term ID' }, { status: 400 });
    }

    await ensurePublishedColumn();

    const { rows } = await pool.query(
      `SELECT * FROM glossary_terms WHERE id = $1`,
      [termId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    const term = rows[0];
    return NextResponse.json({
      term: {
        ...term,
        published: term.published !== false,
        created_at: term.created_at ? new Date(term.created_at).toISOString() : null,
        updated_at: term.updated_at ? new Date(term.updated_at).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching term:', error);
    return NextResponse.json(
      { message: 'Failed to fetch term', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/terms/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const termId = parseTermId(id);
    if (termId === null) {
      return NextResponse.json({ message: 'Invalid term ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      term,
      slug,
      definition,
      category = 'General',
      difficulty_level = 'Beginner',
      learning_path = '',
      knowledge_test = '',
      quiz = '',
      usage_examples = '',
      official_docs_url = '',
      video_tutorial_url = '',
      related_article_url = '',
      published = true,
      seo_title = '',
      seo_description = '',
      seo_keywords = '',
      schema_json = '',
    } = body;

    if (!term || !definition) {
      return NextResponse.json(
        { message: 'Term and definition are required' },
        { status: 400 }
      );
    }

    await ensurePublishedColumn();

    const finalSlug =
      slug ||
      String(term)
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');

    const slugConflict = await pool.query(
      'SELECT id FROM glossary_terms WHERE slug = $1 AND id <> $2',
      [finalSlug, termId]
    );
    if (slugConflict.rows.length > 0) {
      return NextResponse.json(
        { message: 'Term with this slug already exists' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `UPDATE glossary_terms SET
        term = $1,
        slug = $2,
        definition = $3,
        category = $4,
        difficulty_level = $5,
        learning_path = $6,
        knowledge_test = $7,
        usage_examples = $8,
        official_docs_url = $9,
        video_tutorial_url = $10,
        related_article_url = $11,
        published = $12,
        seo_title = $13,
        seo_description = $14,
        seo_keywords = $15,
        schema_json = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING *`,
      [
        term,
        finalSlug,
        definition,
        category,
        difficulty_level,
        learning_path,
        knowledge_test || quiz || '',
        usage_examples,
        official_docs_url,
        video_tutorial_url,
        related_article_url,
        Boolean(published),
        seo_title,
        seo_description,
        seo_keywords,
        schema_json,
        termId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Term updated successfully',
      term: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating term:', error);
    return NextResponse.json(
      { message: 'Failed to update term', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/terms/[id] — toggle publish status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const termId = parseTermId(id);
    if (termId === null) {
      return NextResponse.json({ message: 'Invalid term ID' }, { status: 400 });
    }

    const body = await request.json();
    if (typeof body.published !== 'boolean') {
      return NextResponse.json(
        { message: 'published boolean is required' },
        { status: 400 }
      );
    }

    await ensurePublishedColumn();

    const result = await pool.query(
      `UPDATE glossary_terms
       SET published = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [body.published, termId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Term updated successfully',
      term: result.rows[0],
    });
  } catch (error) {
    console.error('Error patching term:', error);
    return NextResponse.json(
      { message: 'Failed to update term', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/terms/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const termId = parseTermId(id);
    if (termId === null) {
      return NextResponse.json({ message: 'Invalid term ID' }, { status: 400 });
    }

    const existing = await pool.query(
      'SELECT id, term FROM glossary_terms WHERE id = $1',
      [termId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM glossary_terms WHERE id = $1', [termId]);

    return NextResponse.json({
      success: true,
      message: 'Term deleted successfully',
      deleted: existing.rows[0],
    });
  } catch (error) {
    console.error('Error deleting term:', error);
    return NextResponse.json(
      { message: 'Failed to delete term', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
