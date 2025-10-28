import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeVariants = searchParams.get('include_variants') === 'true';
    
    let query = `
      SELECT 
        s.id, 
        s.title,
        s.slug,
        s.description,
        s.script_content,
        s.program_output,
        s.script_type,
        s.language,
        s.os_compatibility,
        s.difficulty,
        s.tags,
        s.featured_image,
        s.meta_title,
        s.meta_description,
        s.published,
        s.is_multi_language,
        s.primary_language,
        s.available_languages,
        s.author_id,
        s.created_at,
        s.updated_at
      FROM 
        scripts s
      ORDER BY 
        s.created_at DESC
    `;

    const { rows } = await pool.query(query);

    // If including variants, fetch them for each script
    if (includeVariants) {
      for (let script of rows) {
        if (script.is_multi_language) {
          const variantQuery = `
            SELECT 
              id,
              language,
              script_content,
              program_output,
              file_extension,
              created_at,
              updated_at
            FROM script_variants 
            WHERE script_id = $1
            ORDER BY language
          `;
          const variantResult = await pool.query(variantQuery, [script.id]);
          script.variants = variantResult.rows;
        }
      }
    }

    return NextResponse.json({ scripts: rows });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const body = await request.json();
    const {
      title,
      slug,
      description,
      script_content,
      program_output,
      script_type,
      language,
      os_compatibility,
      difficulty,
      tags,
      featured_image,
      meta_title,
      meta_description,
      published = false,
      is_multi_language = false,
      primary_language,
      available_languages = [],
      variants = []
    } = body;

    // Insert main script
    const scriptResult = await client.query(`
      INSERT INTO scripts (
        title, slug, description, script_content, program_output,
        script_type, language, os_compatibility, difficulty, tags,
        featured_image, meta_title, meta_description, published,
        is_multi_language, primary_language, available_languages
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      title, slug, description, script_content, program_output,
      script_type, language, os_compatibility, difficulty, tags,
      featured_image, meta_title, meta_description, published,
      is_multi_language, primary_language || language, available_languages.length > 0 ? available_languages : [language]
    ]);

    const script = scriptResult.rows[0];

    // Insert variants if provided
    if (is_multi_language && variants && variants.length > 0) {
      for (const variant of variants) {
        await client.query(`
          INSERT INTO script_variants (
            script_id, language, script_content, program_output, file_extension
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          script.id,
          variant.language,
          variant.script_content,
          variant.program_output || '',
          variant.file_extension || getFileExtension(variant.language)
        ]);
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ script }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating script:', error);
    return NextResponse.json(
      { error: 'Failed to create script' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

function getFileExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    'bash': 'sh',
    'python': 'py',
    'javascript': 'js',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'java': 'java',
    'c': 'c',
    'c++': 'cpp',
    'c#': 'cs',
    'powershell': 'ps1',
    'sql': 'sql'
  };
  return extensions[language.toLowerCase()] || 'txt';
}
