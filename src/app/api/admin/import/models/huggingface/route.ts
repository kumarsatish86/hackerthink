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

// POST import model from HuggingFace
export async function POST(request: NextRequest) {
  try {
    const { identifier, auto_approval = false, apply_enrichment = true } = await request.json();

    console.log('Import request received:', { identifier, auto_approval, apply_enrichment });

    if (!identifier) {
      return NextResponse.json(
        { error: 'Model identifier is required' },
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
    let fetchedData;
    try {
      fetchedData = await hfService.fetchModel(identifier);
    } catch (fetchError) {
      console.error('Error fetching model from HuggingFace:', fetchError);
      throw new Error(`Failed to fetch model from HuggingFace: ${(fetchError as Error).message}`);
    }

    // Validate fetched data
    if (!fetchedData || !fetchedData.name || !fetchedData.slug) {
      console.error('Invalid fetched data:', fetchedData);
      throw new Error('Invalid data received from HuggingFace API');
    }

    // Apply AI enrichment if requested
    let enrichment = {};
    if (apply_enrichment) {
      try {
        const enrichmentService = new AIEnrichmentService();
        enrichment = await enrichmentService.enrich({
          name: fetchedData.name,
          description: fetchedData.description || '',
          model_type: fetchedData.model_type || 'general',
          parameters: fetchedData.parameters || fetchedData.metadata?.siblings?.find((s: any) => s.rfilename?.endsWith('.json'))?.size?.toString() || 'unknown',
          capabilities: fetchedData.categories || []
        });
      } catch (enrichError) {
        console.error('Error applying enrichment (continuing without it):', enrichError);
        // Continue without enrichment rather than failing the import
      }
    }

    // Check if model already exists
    let existingCheck;
    try {
      existingCheck = await pool.query(
        'SELECT id FROM ai_models WHERE slug = $1',
        [fetchedData.slug]
      );
    } catch (dbError) {
      console.error('Database error checking existing model:', dbError);
      throw new Error(`Database error: ${(dbError as Error).message}`);
    }

    // Extract technical details from fetched data
    const parameters = fetchedData.parameters;
    const architecture = fetchedData.architecture;
    const contextLength = fetchedData.context_length;
    const license = fetchedData.license;
    const fullDescription = fetchedData.full_description;
    const tokenizer = fetchedData.tokenizer;
    const vocabularySize = fetchedData.vocabulary_size;
    const trainingFramework = fetchedData.training_framework;
    const quantizedVersions = fetchedData.quantized_versions;
    const trainingDataSources = fetchedData.training_data_sources;

    // Ensure arrays are always arrays, not undefined
    const categoriesArray = Array.isArray(fetchedData.categories) ? fetchedData.categories : [];
    const tagsArray = Array.isArray(fetchedData.tags) ? fetchedData.tags : [];

    // Check which optional columns exist in the database
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ai_models' 
      AND column_name IN ('tokenizer', 'vocabulary_size', 'training_framework', 'quantized_versions', 'detailed_metadata')
    `);
    const existingColumns = new Set(columnCheck.rows.map((r: any) => r.column_name));
    const hasTokenizer = existingColumns.has('tokenizer');
    const hasVocabularySize = existingColumns.has('vocabulary_size');
    const hasTrainingFramework = existingColumns.has('training_framework');
    const hasQuantizedVersions = existingColumns.has('quantized_versions');
    const hasDetailedMetadata = existingColumns.has('detailed_metadata');

    // Build detailed_metadata with new fields
    const detailedMetadata = {
      ...(fetchedData.detailed_metadata || {}),
      training_data_sources: trainingDataSources || undefined,
      extracted_at: new Date().toISOString(),
      // Store technical details in metadata if columns don't exist
      tokenizer: !hasTokenizer ? tokenizer : undefined,
      vocabulary_size: !hasVocabularySize ? vocabularySize : undefined,
      training_framework: !hasTrainingFramework ? trainingFramework : undefined,
      quantized_versions: !hasQuantizedVersions ? quantizedVersions : undefined
    };

    let result;
    if (existingCheck.rows.length > 0) {
      // Update existing model - build query dynamically based on available columns
      const updateFields = [
        'name = $1', 'developer = $2', 'description = $3', 'full_description = $4', 
        'model_type = $5', 'architecture = $6', 'parameters = $7', 'context_length = $8', 
        'license = $9'
      ];
      const updateValues: any[] = [
        fetchedData.name,
        fetchedData.developer || null,
        fetchedData.description || '',
        fullDescription || null,
        fetchedData.model_type || 'general',
        architecture || null,
        parameters || null,
        contextLength || null,
        license || null
      ];

      let paramIndex = 10;
      if (hasTokenizer) {
        updateFields.push(`tokenizer = $${paramIndex}`);
        updateValues.push(tokenizer || null);
        paramIndex++;
      }
      if (hasVocabularySize) {
        updateFields.push(`vocabulary_size = $${paramIndex}`);
        updateValues.push(vocabularySize || null);
        paramIndex++;
      }
      if (hasTrainingFramework) {
        updateFields.push(`training_framework = $${paramIndex}`);
        updateValues.push(trainingFramework || null);
        paramIndex++;
      }
      if (hasQuantizedVersions) {
        updateFields.push(`quantized_versions = $${paramIndex}`);
        updateValues.push(quantizedVersions ? JSON.stringify(quantizedVersions) : null);
        paramIndex++;
      }
      if (hasDetailedMetadata) {
        updateFields.push(`detailed_metadata = $${paramIndex}`);
        updateValues.push(Object.keys(detailedMetadata).length > 0 ? JSON.stringify(detailedMetadata) : null);
        paramIndex++;
      }

      // Add remaining fields
      updateFields.push(`github_url = $${paramIndex}`);
      updateValues.push(fetchedData.github_url || null);
      paramIndex++;
      
      updateFields.push(`huggingface_url = $${paramIndex}`);
      updateValues.push(fetchedData.huggingface_url || null);
      paramIndex++;
      
      updateFields.push(`download_count = $${paramIndex}`);
      updateValues.push(fetchedData.download_count || 0);
      paramIndex++;
      
      updateFields.push(`categories = $${paramIndex}`);
      updateValues.push(JSON.stringify(categoriesArray));
      paramIndex++;
      
      updateFields.push(`tags = $${paramIndex}`);
      updateValues.push(JSON.stringify(tagsArray));
      paramIndex++;
      
      updateFields.push(`import_source = $${paramIndex}`);
      updateValues.push('huggingface');
      paramIndex++;
      
      updateFields.push(`import_metadata = $${paramIndex}`);
      updateValues.push(JSON.stringify({
        ...(fetchedData.metadata || {}),
        readme: fetchedData.metadata?.readme && fetchedData.metadata.readme.length > 100000
          ? fetchedData.metadata.readme.substring(0, 100000) + '... [truncated]'
          : fetchedData.metadata?.readme,
        files: fetchedData.files || [],
        license_text: fetchedData.license_text || null
      }));
      paramIndex++;
      
      updateFields.push(`enrichment_applied = $${paramIndex}`);
      updateValues.push(apply_enrichment);
      paramIndex++;
      
      updateFields.push(`ideal_hardware = $${paramIndex}`);
      updateValues.push((enrichment as any).ideal_hardware || null);
      paramIndex++;
      
      updateFields.push(`risk_score = $${paramIndex}`);
      updateValues.push((enrichment as any).risk_score || null);
      paramIndex++;
      
      updateFields.push(`comparison_notes = $${paramIndex}`);
      updateValues.push((enrichment as any).comparison_notes || null);
      paramIndex++;
      
      updateFields.push(`tutorial_links = $${paramIndex}`);
      updateValues.push(JSON.stringify((enrichment as any).tutorial_links || []));
      paramIndex++;
      
      updateFields.push(`community_links = $${paramIndex}`);
      updateValues.push(JSON.stringify((enrichment as any).community_links || []));
      paramIndex++;
      
      // Update status based on auto_approval
      const modelStatus = auto_approval ? 'published' : 'draft';
      console.log('Updating model status:', { auto_approval, modelStatus });
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(modelStatus);
      paramIndex++;
      
      updateFields.push('updated_at = NOW()');
      
      // Add slug for WHERE clause
      updateValues.push(fetchedData.slug);

      const updateQuery = `UPDATE ai_models SET ${updateFields.join(', ')} WHERE slug = $${paramIndex} RETURNING *`;
      
      try {
        result = await pool.query(updateQuery, updateValues);
      } catch (dbError) {
        console.error('Database error updating model:', dbError);
        throw new Error(`Failed to update model in database: ${(dbError as Error).message}`);
      }
    } else {
      // Insert new model - build query dynamically based on available columns
      const insertFields = [
        'name', 'slug', 'developer', 'description', 'full_description', 'model_type',
        'architecture', 'parameters', 'context_length', 'license'
      ];
      const insertValues: any[] = [
        fetchedData.name,
        fetchedData.slug,
        fetchedData.developer || 'Unknown',
        fetchedData.description || '',
        fullDescription || null,
        fetchedData.model_type || 'general',
        architecture || null,
        parameters || null,
        contextLength || null,
        license || null
      ];

      let paramIndex = 11;
      if (hasTokenizer) {
        insertFields.push('tokenizer');
        insertValues.push(tokenizer || null);
      }
      if (hasVocabularySize) {
        insertFields.push('vocabulary_size');
        insertValues.push(vocabularySize || null);
      }
      if (hasTrainingFramework) {
        insertFields.push('training_framework');
        insertValues.push(trainingFramework || null);
      }
      if (hasQuantizedVersions) {
        insertFields.push('quantized_versions');
        insertValues.push(quantizedVersions ? JSON.stringify(quantizedVersions) : null);
      }
      if (hasDetailedMetadata) {
        insertFields.push('detailed_metadata');
        insertValues.push(Object.keys(detailedMetadata).length > 0 ? JSON.stringify(detailedMetadata) : null);
      }

      insertFields.push(
        'github_url', 'huggingface_url', 'download_count', 'categories', 'tags',
        'status', 'import_source', 'import_metadata', 'enrichment_applied',
        'ideal_hardware', 'risk_score', 'comparison_notes', 'tutorial_links', 'community_links'
      );
      
      const modelStatus = auto_approval ? 'published' : 'draft';
      console.log('Setting model status:', { auto_approval, modelStatus });
      
      insertValues.push(
        fetchedData.github_url || null,
        fetchedData.huggingface_url || null,
        fetchedData.download_count || 0,
        JSON.stringify(categoriesArray),
        JSON.stringify(tagsArray),
        modelStatus,
        'huggingface',
        JSON.stringify({
          ...(fetchedData.metadata || {}),
          readme: fetchedData.metadata?.readme && fetchedData.metadata.readme.length > 100000
            ? fetchedData.metadata.readme.substring(0, 100000) + '... [truncated]'
            : fetchedData.metadata?.readme,
          files: fetchedData.files || [],
          license_text: fetchedData.license_text || null
        }),
        apply_enrichment,
        (enrichment as any).ideal_hardware || null,
        (enrichment as any).risk_score || null,
        (enrichment as any).comparison_notes || null,
        JSON.stringify((enrichment as any).tutorial_links || []),
        JSON.stringify((enrichment as any).community_links || [])
      );

      const placeholders = insertFields.map((_, i) => `$${i + 1}`).join(', ');
      const insertQuery = `INSERT INTO ai_models (${insertFields.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      try {
        result = await pool.query(insertQuery, insertValues);
      } catch (dbError) {
        console.error('Database error inserting model:', dbError);
        throw new Error(`Failed to insert model into database: ${(dbError as Error).message}`);
      }
    }

    // Log import
    await pool.query(
      `INSERT INTO import_logs (source, item_type, item_id, import_status, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      ['huggingface', 'model', result.rows[0].id, 'success', JSON.stringify(fetchedData)]
    );

    return NextResponse.json({
      model: result.rows[0],
      message: existingCheck.rows.length > 0 ? 'Model updated successfully' : 'Model imported successfully',
      enrichment_applied: apply_enrichment,
      is_update: existingCheck.rows.length > 0
    });
  } catch (error) {
    console.error('Error importing model from HuggingFace:', error);
    console.error('Error stack:', (error as Error).stack);
    console.error('Error name:', (error as Error).name);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log error
    try {
      await pool.query(
        `INSERT INTO import_logs (source, item_type, import_status, error_message, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['huggingface', 'model', 'failed', errorMessage, JSON.stringify({ identifier, stack: errorStack })]
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to import model', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

