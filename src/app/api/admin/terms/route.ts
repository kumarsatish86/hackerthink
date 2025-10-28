import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if the advanced columns exist
    const { rows: columns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'glossary_terms' 
      AND column_name = 'difficulty_level'
    `);

    // Use a query that only includes fields we know exist
    let query;
    if (columns.length > 0) {
      // Advanced columns exist, query all fields
      query = `
      SELECT 
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
        created_at,
        updated_at
      FROM glossary_terms
      ORDER BY term ASC
      `;
    } else {
      // Basic columns only
      query = `
        SELECT 
          id, 
          term,
          slug,
          definition,
          category,
          created_at,
          updated_at
        FROM glossary_terms
        ORDER BY term ASC
      `;
    }

    // Fetch terms from database
    const { rows } = await pool.query(query);

    // Format dates for display
    const terms = rows.map(term => ({
      ...term,
      // Add empty values for missing fields to ensure consistent response shape
      difficulty_level: term.difficulty_level || 'Beginner',
      learning_path: term.learning_path || '',
      knowledge_test: term.knowledge_test || '',
      usage_examples: term.usage_examples || '',
      official_docs_url: term.official_docs_url || '',
      video_tutorial_url: term.video_tutorial_url || '',
      related_article_url: term.related_article_url || '',
      created_at: new Date(term.created_at).toISOString(),
      updated_at: new Date(term.updated_at).toISOString()
    }));

    return NextResponse.json({ terms });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { term, slug, definition, category = 'General', difficulty_level = 'Beginner', 
      learning_path = '', knowledge_test = '', usage_examples = '', 
      official_docs_url = '', video_tutorial_url = '', related_article_url = '' } = await request.json();

    // Validation
    if (!term || !definition) {
      return NextResponse.json(
        { message: 'Term and definition are required' },
        { status: 400 }
      );
    }

    // Generate slug from term if not provided
    const finalSlug = slug || term.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

    // Check if slug already exists
    const existingSlug = await pool.query(
      'SELECT * FROM glossary_terms WHERE slug = $1',
      [finalSlug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { message: 'Term with this slug already exists' },
        { status: 409 }
      );
    }

    // Check if advanced columns exist before inserting
    const { rows: columns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'glossary_terms' 
      AND column_name = 'difficulty_level'
    `);

    let result;
    if (columns.length > 0) {
      // Advanced columns exist, insert with all fields
      result = await pool.query(
      `INSERT INTO glossary_terms (
        term, slug, definition, category, 
        difficulty_level, learning_path, knowledge_test, usage_examples,
        official_docs_url, video_tutorial_url, related_article_url,
        created_at, updated_at
      )
       VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
       RETURNING id, term, slug, definition, category, 
         difficulty_level, learning_path, knowledge_test, usage_examples,
         official_docs_url, video_tutorial_url, related_article_url,
         created_at, updated_at`,
      [
        term, finalSlug, definition, category, 
        difficulty_level, learning_path, knowledge_test, usage_examples,
        official_docs_url, video_tutorial_url, related_article_url
      ]
    );
    } else {
      // Basic columns only
      result = await pool.query(
        `INSERT INTO glossary_terms (
          term, slug, definition, category,
          created_at, updated_at
        )
         VALUES (
          $1, $2, $3, $4,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
         RETURNING id, term, slug, definition, category, created_at, updated_at`,
        [
          term, finalSlug, definition, category
        ]
      );
    }

    const newTerm = {
      ...result.rows[0],
      // Add empty values for missing fields to ensure consistent response shape
      difficulty_level: result.rows[0].difficulty_level || 'Beginner',
      learning_path: result.rows[0].learning_path || '',
      knowledge_test: result.rows[0].knowledge_test || '',
      usage_examples: result.rows[0].usage_examples || '',
      official_docs_url: result.rows[0].official_docs_url || '',
      video_tutorial_url: result.rows[0].video_tutorial_url || '',
      related_article_url: result.rows[0].related_article_url || ''
    };

    return NextResponse.json(
      { message: 'Term created successfully', term: newTerm },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating term:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 
