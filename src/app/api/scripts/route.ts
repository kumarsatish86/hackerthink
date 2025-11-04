import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET() {
  try {
    // Query to fetch all published scripts with their variants
    const { rows } = await pool.query(`
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
        s.is_multi_language,
        s.primary_language,
        s.available_languages,
        s.author_id,
        s.created_at,
        s.updated_at
      FROM 
        scripts s
      WHERE s.published = true
      ORDER BY 
        s.created_at DESC
    `);

    // Fetch variants for multi-language scripts
    for (let script of rows) {
      if (script.is_multi_language) {
        const variantResult = await pool.query(`
          SELECT 
            id,
            language,
            script_content,
            program_output,
            file_extension
          FROM script_variants 
          WHERE script_id = $1
          ORDER BY language
        `, [script.id]);
        
        script.variants = variantResult.rows;
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
