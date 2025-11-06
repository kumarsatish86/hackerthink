import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import getConfig from 'next/config';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

// Get server runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Create a database connection pool using server runtime config
const pool = new Pool({
  host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(serverRuntimeConfig.DB_PORT || process.env.DB_PORT || '5432'),
  user: serverRuntimeConfig.DB_USER || process.env.DB_USER || 'postgres',
  password: serverRuntimeConfig.DB_PASSWORD || process.env.DB_PASSWORD || 'Admin1234',
  database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME || 'hackerthink',
});

// GET /api/admin/scripts/[id] - Get single script
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[GET /api/admin/scripts/[id]] Starting fetch request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[GET /api/admin/scripts/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[GET /api/admin/scripts/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      console.log('[GET /api/admin/scripts/[id]] Invalid script ID:', id);
      return NextResponse.json(
        { message: 'Invalid script ID' },
        { status: 400 }
      );
    }

    console.log('[GET /api/admin/scripts/[id]] Parsed script ID:', scriptId);

    const client = await pool.connect();

    try {
      // Fetch script with variants if multi-language
      const result = await client.query(
        `SELECT 
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
        FROM scripts s
        WHERE s.id = $1`,
        [scriptId]
      );

      if (result.rows.length === 0) {
        console.log('[GET /api/admin/scripts/[id]] Script not found with ID:', scriptId);
        return NextResponse.json(
          { message: 'Script not found' },
          { status: 404 }
        );
      }

      const script = result.rows[0];

      // If multi-language, fetch variants
      if (script.is_multi_language) {
        const variantResult = await client.query(
          `SELECT 
            id,
            language,
            script_content,
            program_output,
            file_extension,
            created_at,
            updated_at
          FROM script_variants 
          WHERE script_id = $1
          ORDER BY language`,
          [scriptId]
        );
        script.variants = variantResult.rows;
      }

      console.log('[GET /api/admin/scripts/[id]] Script found:', script.title);
      return NextResponse.json({
        script
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[GET /api/admin/scripts/[id]] Error fetching script:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch script',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/scripts/[id] - Update script
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[PUT /api/admin/scripts/[id]] Starting update request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[PUT /api/admin/scripts/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[PUT /api/admin/scripts/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      console.log('[PUT /api/admin/scripts/[id]] Invalid script ID:', id);
      return NextResponse.json(
        { message: 'Invalid script ID' },
        { status: 400 }
      );
    }

    console.log('[PUT /api/admin/scripts/[id]] Parsed script ID:', scriptId);

    const data = await request.json();
    const client = await pool.connect();

    try {
      // Check if script exists
      const existingScript = await client.query(
        'SELECT id, title FROM scripts WHERE id = $1',
        [scriptId]
      );

      if (existingScript.rows.length === 0) {
        console.log('[PUT /api/admin/scripts/[id]] Script not found with ID:', scriptId);
        return NextResponse.json(
          { message: 'Script not found' },
          { status: 404 }
        );
      }

      // If just updating published status (from handlePublishToggle)
      if (data.published !== undefined && Object.keys(data).length === 1) {
        const result = await client.query(
          'UPDATE scripts SET published = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [data.published, scriptId]
        );

        console.log('[PUT /api/admin/scripts/[id]] Script published status updated:', result.rows[0].title);
        return NextResponse.json({
          script: result.rows[0],
          message: 'Script updated successfully'
        });
      }

      // Full update with all fields
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
      } = data;

      // Check if slug is being changed and if new slug already exists
      if (slug) {
        const slugCheck = await client.query(
          'SELECT id FROM scripts WHERE slug = $1 AND id != $2',
          [slug, scriptId]
        );

        if (slugCheck.rows.length > 0) {
          return NextResponse.json(
            { message: 'A script with this slug already exists' },
            { status: 400 }
          );
        }
      }

      await client.query('BEGIN');

      // Update script
      const updateQuery = `
        UPDATE scripts
        SET 
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          script_content = COALESCE($4, script_content),
          program_output = COALESCE($5, program_output),
          script_type = COALESCE($6, script_type),
          language = COALESCE($7, language),
          os_compatibility = COALESCE($8, os_compatibility),
          difficulty = COALESCE($9, difficulty),
          tags = COALESCE($10, tags),
          featured_image = COALESCE($11, featured_image),
          meta_title = COALESCE($12, meta_title),
          meta_description = COALESCE($13, meta_description),
          published = COALESCE($14, published),
          is_multi_language = COALESCE($15, is_multi_language),
          primary_language = COALESCE($16, primary_language),
          available_languages = COALESCE($17, available_languages),
          updated_at = NOW()
        WHERE id = $18
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        title, slug, description, script_content, program_output,
        script_type, language, os_compatibility, difficulty, tags,
        featured_image, meta_title, meta_description, published,
        is_multi_language, primary_language, available_languages,
        scriptId
      ]);

      // Update variants if provided and script is multi-language
      if (is_multi_language && variants && Array.isArray(variants)) {
        // Delete existing variants
        await client.query('DELETE FROM script_variants WHERE script_id = $1', [scriptId]);

        // Insert new variants
        for (const variant of variants) {
          const fileExtension = variant.file_extension || getFileExtension(variant.language);
          await client.query(
            `INSERT INTO script_variants (
              script_id, language, script_content, program_output, file_extension
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              scriptId,
              variant.language,
              variant.script_content,
              variant.program_output || '',
              fileExtension
            ]
          );
        }
      }

      await client.query('COMMIT');

      console.log('[PUT /api/admin/scripts/[id]] Script updated successfully:', result.rows[0].title);
      return NextResponse.json({
        script: result.rows[0],
        message: 'Script updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[PUT /api/admin/scripts/[id]] Error updating script:', error);
      return NextResponse.json(
        {
          message: 'Failed to update script',
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PUT /api/admin/scripts/[id]] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to update script',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scripts/[id] - Delete script
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/scripts/[id]] Starting delete request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/scripts/[id]] Unauthorized - no session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/scripts/[id]] Forbidden - not admin');
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const scriptId = parseInt(id);

    if (isNaN(scriptId)) {
      console.log('[DELETE /api/admin/scripts/[id]] Invalid script ID:', id);
      return NextResponse.json(
        { message: 'Invalid script ID' },
        { status: 400 }
      );
    }

    console.log('[DELETE /api/admin/scripts/[id]] Parsed script ID:', scriptId);
    console.log('[DELETE /api/admin/scripts/[id]] Database config:', {
      host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST,
      port: serverRuntimeConfig.DB_PORT || process.env.DB_PORT,
      user: serverRuntimeConfig.DB_USER || process.env.DB_USER,
      database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME,
    });

    const client = await pool.connect();

    try {
      // Check if script exists
      console.log('[DELETE /api/admin/scripts/[id]] Checking if script exists...');
      const existingScript = await client.query(
        'SELECT id, title FROM scripts WHERE id = $1',
        [scriptId]
      );

      console.log('[DELETE /api/admin/scripts/[id]] Script check result:', existingScript.rows.length > 0 ? 'Found' : 'Not found');

      if (existingScript.rows.length === 0) {
        console.log('[DELETE /api/admin/scripts/[id]] Script not found with ID:', scriptId);
        return NextResponse.json(
          { message: 'Script not found' },
          { status: 404 }
        );
      }

      console.log('[DELETE /api/admin/scripts/[id]] Deleting script:', existingScript.rows[0].title);

      await client.query('BEGIN');

      // Delete variants first (if CASCADE doesn't exist)
      await client.query('DELETE FROM script_variants WHERE script_id = $1', [scriptId]);

      // Delete script
      const result = await client.query(
        'DELETE FROM scripts WHERE id = $1 RETURNING id, title',
        [scriptId]
      );

      await client.query('COMMIT');

      console.log('[DELETE /api/admin/scripts/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

      if (result.rows.length === 0) {
        console.error('[DELETE /api/admin/scripts/[id]] Delete query returned no rows');
        return NextResponse.json(
          { message: 'Failed to delete script' },
          { status: 500 }
        );
      }

      console.log('[DELETE /api/admin/scripts/[id]] Script deleted successfully:', result.rows[0]);
      return NextResponse.json({
        message: 'Script deleted successfully',
        deleted: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[DELETE /api/admin/scripts/[id]] Error deleting script:', error);
      console.error('[DELETE /api/admin/scripts/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check for foreign key constraint errors
      if (error instanceof Error && error.message.includes('foreign key')) {
        return NextResponse.json(
          {
            message: 'Cannot delete script: It has related data. Please delete related data first.',
            error: error.message
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: 'Failed to delete script',
          error: error instanceof Error ? error.message : String(error),
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[DELETE /api/admin/scripts/[id]] Outer error:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete script',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Helper function to get file extension from language
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

