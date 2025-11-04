import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: string;
  difficulty_level?: string;
  learning_path?: string;
  knowledge_test?: string;
  usage_examples?: string;
  official_docs_url?: string;
  video_tutorial_url?: string;
  related_article_url?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

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
        WHERE slug = $1
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
        WHERE slug = $1
      `;
    }

    // Fetch term from database
    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Term not found' }, { status: 404 });
    }

    // Add default values for any missing fields
    const termData = rows[0] as any;
    const term: GlossaryTerm = {
      ...termData,
      difficulty_level: termData.difficulty_level || 'Beginner',
      learning_path: termData.learning_path || '',
      knowledge_test: termData.knowledge_test || '',
      usage_examples: termData.usage_examples || '',
      official_docs_url: termData.official_docs_url || '',
      video_tutorial_url: termData.video_tutorial_url || '',
      related_article_url: termData.related_article_url || ''
    };

    // Get related terms (same category)
    const relatedTerms = await pool.query(
      `SELECT 
        id, 
        term,
        slug,
        category
      FROM glossary_terms
      WHERE category = $1 AND id != $2::integer
      ORDER BY term ASC
      LIMIT 5`,
      [term.category, term.id]
    );

    return NextResponse.json({
      term,
      relatedTerms: relatedTerms.rows
    });
  } catch (error) {
    console.error('Error fetching term:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 