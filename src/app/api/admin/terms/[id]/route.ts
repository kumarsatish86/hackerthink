import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing properties
    const params = await context.params;
    const termId = params.id;

    // Fetch term from database
    const { rows } = await pool.query(
      `SELECT 
        id, 
        term,
        slug,
        definition,
        category,
        difficulty_level,
        learning_path,
        knowledge_test,
        usage_examples,
        official_docs_url,
        video_tutorial_url,
        related_article_url,
        seo_title,
        seo_description,
        seo_keywords,
        schema_json,
        created_at,
        updated_at
      FROM glossary_terms 
      WHERE id = $1::integer`,
      [termId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    const term = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString()
    };

    return NextResponse.json({ term });
  } catch (error) {
    console.error('Error fetching term:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing properties
    const params = await context.params;
    const termId = params.id;
    
    const { term, slug, definition, category, difficulty_level, learning_path, knowledge_test, 
      usage_examples, official_docs_url, video_tutorial_url, related_article_url, seo_title, 
      seo_description, seo_keywords, schema_json } = await request.json();

    // Validation
    if (!term && !definition) {
      return NextResponse.json(
        { message: 'Term or definition must be provided' },
        { status: 400 }
      );
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (term) {
      updates.push(`term = $${paramIndex}`);
      values.push(term);
      paramIndex++;
    }

    if (slug) {
      // Check if slug already exists for another term
      const existingSlug = await pool.query(
        'SELECT * FROM glossary_terms WHERE slug = $1 AND id != $2::integer',
        [slug, termId]
      );

      if (existingSlug.rows.length > 0) {
        return NextResponse.json(
          { message: 'Term with this slug already exists' },
          { status: 409 }
        );
      }

      updates.push(`slug = $${paramIndex}`);
      values.push(slug);
      paramIndex++;
    }

    if (definition) {
      updates.push(`definition = $${paramIndex}`);
      values.push(definition);
      paramIndex++;
    }

    if (category) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (difficulty_level) {
      updates.push(`difficulty_level = $${paramIndex}`);
      values.push(difficulty_level);
      paramIndex++;
    }

    if (learning_path) {
      updates.push(`learning_path = $${paramIndex}`);
      values.push(learning_path);
      paramIndex++;
    }

    if (knowledge_test) {
      updates.push(`knowledge_test = $${paramIndex}`);
      values.push(knowledge_test);
      paramIndex++;
    }

    if (usage_examples) {
      updates.push(`usage_examples = $${paramIndex}`);
      values.push(usage_examples);
      paramIndex++;
    }

    if (official_docs_url) {
      updates.push(`official_docs_url = $${paramIndex}`);
      values.push(official_docs_url);
      paramIndex++;
    }

    if (video_tutorial_url) {
      updates.push(`video_tutorial_url = $${paramIndex}`);
      values.push(video_tutorial_url);
      paramIndex++;
    }

    if (related_article_url) {
      updates.push(`related_article_url = $${paramIndex}`);
      values.push(related_article_url);
      paramIndex++;
    }

    if (seo_title !== undefined) {
      updates.push(`seo_title = $${paramIndex}`);
      values.push(seo_title);
      paramIndex++;
    }

    if (seo_description !== undefined) {
      updates.push(`seo_description = $${paramIndex}`);
      values.push(seo_description);
      paramIndex++;
    }

    if (seo_keywords !== undefined) {
      updates.push(`seo_keywords = $${paramIndex}`);
      values.push(seo_keywords);
      paramIndex++;
    }

    if (schema_json !== undefined) {
      updates.push(`schema_json = $${paramIndex}`);
      values.push(schema_json);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause and finalize query
    values.push(termId);
    const query = `
      UPDATE glossary_terms 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}::integer
      RETURNING id, term, slug, definition, category, created_at, updated_at
    `;

    // Execute the query
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    const updatedTerm = {
      ...rows[0],
      created_at: new Date(rows[0].created_at).toISOString(),
      updated_at: new Date(rows[0].updated_at).toISOString()
    };

    return NextResponse.json({
      message: 'Term updated successfully',
      term: updatedTerm
    });
  } catch (error) {
    console.error('Error updating term:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing properties
    const params = await context.params;
    const termId = params.id;

    // Delete term from database
    const { rowCount } = await pool.query(
      'DELETE FROM glossary_terms WHERE id = $1::integer',
      [termId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Term deleted successfully' });
  } catch (error) {
    console.error('Error deleting term:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 