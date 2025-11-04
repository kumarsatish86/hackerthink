import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    
    if (!slug) {
      return NextResponse.json({ message: 'Script slug is required' }, { status: 400 });
    }

    // Fetch script from database by slug, only fetch published scripts
    const { rows } = await pool.query(`
      SELECT 
        s.*,
        'Admin User' as author_name
      FROM scripts s
      WHERE s.slug = $1 AND s.published = true
    `, [slug]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Script not found' }, { status: 404 });
    }

    const script = rows[0];

    // If it's a multi-language script, fetch variants
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

      // If a specific language is requested, try to find that variant
      if (language && script.variants.length > 0) {
        const requestedVariant = script.variants.find((v: any) => 
          v.language.toLowerCase() === language.toLowerCase()
        );
        
        if (requestedVariant) {
          // Override the main script content with the requested language variant
          script.script_content = requestedVariant.script_content;
          script.program_output = requestedVariant.program_output;
          script.language = requestedVariant.language;
          script.file_extension = requestedVariant.file_extension;
        }
      }
    }

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error fetching script by slug:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}