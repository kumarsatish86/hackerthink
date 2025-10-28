import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ message: 'Script ID is required' }, { status: 400 });
    }

    // Fetch script with variants
    const scriptResult = await pool.query(`
      SELECT 
        s.*,
        'Admin User' as author_name
      FROM scripts s
      WHERE s.id = $1
    `, [id]);

    if (scriptResult.rows.length === 0) {
      return NextResponse.json({ message: 'Script not found' }, { status: 404 });
    }

    const script = scriptResult.rows[0];

    // Fetch variants if it's a multi-language script
    if (script.is_multi_language) {
      const variantsResult = await pool.query(`
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
      `, [id]);
      
      script.variants = variantsResult.rows;
    }

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error fetching script:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ message: 'Script ID is required' }, { status: 400 });
    }

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
      published,
      is_multi_language,
      primary_language,
      available_languages,
      variants
    } = body;

    // Update main script
    const updateResult = await client.query(`
      UPDATE scripts SET
        title = COALESCE($2, title),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        script_content = COALESCE($5, script_content),
        program_output = COALESCE($6, program_output),
        script_type = COALESCE($7, script_type),
        language = COALESCE($8, language),
        os_compatibility = COALESCE($9, os_compatibility),
        difficulty = COALESCE($10, difficulty),
        tags = COALESCE($11, tags),
        featured_image = COALESCE($12, featured_image),
        meta_title = COALESCE($13, meta_title),
        meta_description = COALESCE($14, meta_description),
        published = COALESCE($15, published),
        is_multi_language = COALESCE($16, is_multi_language),
        primary_language = COALESCE($17, primary_language),
        available_languages = COALESCE($18, available_languages),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, title, slug, description, script_content, program_output,
      script_type, language, os_compatibility, difficulty, tags,
      featured_image, meta_title, meta_description, published,
      is_multi_language, primary_language, available_languages
    ]);

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Script not found' }, { status: 404 });
    }

    const script = updateResult.rows[0];

    // Handle variants if provided
    if (is_multi_language && variants && Array.isArray(variants)) {
      // Delete existing variants
      await client.query('DELETE FROM script_variants WHERE script_id = $1', [id]);
      
      // Insert new variants
      for (const variant of variants) {
        if (variant.language && variant.script_content) {
          await client.query(`
            INSERT INTO script_variants (
              script_id, language, script_content, program_output, file_extension
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            id,
            variant.language,
            variant.script_content,
            variant.program_output || '',
            variant.file_extension || getFileExtension(variant.language)
          ]);
        }
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ script });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating script:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ message: 'Script ID is required' }, { status: 400 });
    }

    // Delete script (variants will be deleted automatically due to CASCADE)
    const result = await pool.query('DELETE FROM scripts WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Script not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Script deleted successfully' });
  } catch (error) {
    console.error('Error deleting script:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
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