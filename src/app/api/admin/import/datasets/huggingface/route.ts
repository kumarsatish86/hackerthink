import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { HuggingFaceService } from '@/services/import/HuggingFaceService';
import { AIEnrichmentService } from '@/services/import/AIEnrichmentService';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// POST import dataset from HuggingFace
export async function POST(request: NextRequest) {
  try {
    const { identifier, auto_approval = false, apply_enrichment = true } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Dataset identifier is required' },
        { status: 400 }
      );
    }

    // Get HuggingFace API key from settings
    const settingsResult = await pool.query(
      'SELECT api_key FROM import_settings WHERE source_name = $1 AND enabled = true',
      ['huggingface']
    );
    const apiKey = settingsResult.rows[0]?.api_key;

    // Fetch from HuggingFace
    const hfService = new HuggingFaceService(apiKey);
    const fetchedData = await hfService.fetchDataset(identifier);

    // Apply AI enrichment
    let enrichment = {};
    if (apply_enrichment) {
      const enrichmentService = new AIEnrichmentService();
      enrichment = await enrichmentService.enrich({
        name: fetchedData.name,
        description: fetchedData.description,
        model_type: fetchedData.dataset_type
      });
    }

    // Add enrichment data to fetched data
    const enrichedData = {
      ...fetchedData,
      ...(enrichment as any),
      enrichment_applied: apply_enrichment
    };

    // Only insert into database if auto_approval is true
    if (auto_approval) {
      const insertQuery = `
        INSERT INTO datasets (
          name, slug, provider, description, dataset_type,
          download_url, huggingface_url, download_count,
          categories, tags, status, import_source, import_metadata,
          enrichment_applied, ideal_hardware, risk_score, comparison_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        fetchedData.name,
        fetchedData.slug,
        fetchedData.provider,
        fetchedData.description,
        fetchedData.dataset_type,
        fetchedData.download_url,
        fetchedData.huggingface_url,
        fetchedData.download_count,
        JSON.stringify(fetchedData.categories || []),
        JSON.stringify(fetchedData.tags || []),
        'published',
        'huggingface',
        JSON.stringify(fetchedData.metadata || {}),
        apply_enrichment,
        (enrichment as any).ideal_hardware,
        (enrichment as any).risk_score,
        (enrichment as any).comparison_notes
      ]);

      // Log import
      await pool.query(
        `INSERT INTO import_logs (source, item_type, item_id, import_status, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['huggingface', 'dataset', result.rows[0].id, 'success', JSON.stringify(fetchedData)]
      );

      return NextResponse.json({
        dataset: result.rows[0],
        message: 'Dataset imported successfully',
        enrichment_applied: apply_enrichment
      });
    }

    // Return fetched data without inserting (for preview/approval)
    return NextResponse.json({
      dataset: enrichedData,
      message: 'Dataset data fetched successfully. Ready for import.',
      enrichment_applied: apply_enrichment
    });
  } catch (error) {
    console.error('Error importing dataset from HuggingFace:', error);
    
    // Log error
    try {
      await pool.query(
        `INSERT INTO import_logs (source, item_type, import_status, error_message, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['huggingface', 'dataset', 'failed', (error as Error).message, JSON.stringify({ identifier })]
      );
    } catch {}

    return NextResponse.json(
      { error: 'Failed to import dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

