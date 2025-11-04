import { Pool } from 'pg';
import { GitHubService } from '@/services/api/GitHubService';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

interface EnrichmentResult {
  success: boolean;
  github_stats?: any;
  community_stats?: any;
  updated_fields: string[];
  errors?: string[];
}

export class ModelEnrichmentService {
  private githubService: GitHubService;

  constructor() {
    const githubApiKey = process.env.GITHUB_API_KEY;
    this.githubService = new GitHubService(githubApiKey);
  }

  /**
   * Enrich a single model with external data
   */
  async enrichModel(modelId: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: true,
      updated_fields: [],
      errors: []
    };

    try {
      // Fetch model from database
      const modelResult = await pool.query(
        'SELECT id, name, slug, github_url, huggingface_url, developer FROM ai_models WHERE id = $1',
        [modelId]
      );

      if (modelResult.rows.length === 0) {
        result.success = false;
        result.errors?.push('Model not found');
        return result;
      }

      const model = modelResult.rows[0];
      console.log(`[Enrichment] Enriching model: ${model.name} (${model.slug})`);

      // Enrich GitHub stats
      if (model.github_url) {
        try {
          const githubStats = await this.githubService.fetchRepoStats(model.github_url);
          if (githubStats) {
            await pool.query(
              `UPDATE ai_models 
               SET github_stats = $1, updated_at = NOW()
               WHERE id = $2`,
              [JSON.stringify(githubStats), modelId]
            );
            result.github_stats = githubStats;
            result.updated_fields.push('github_stats');
            console.log(`[Enrichment] Updated GitHub stats for ${model.name}`);
          }
        } catch (error) {
          const errorMsg = `Failed to fetch GitHub stats: ${(error as Error).message}`;
          result.errors?.push(errorMsg);
          console.error(`[Enrichment] ${errorMsg}`);
        }
      }

      // Enrich community stats from HuggingFace
      if (model.huggingface_url) {
        try {
          const communityStats = await this.enrichHuggingFaceCommunity(model.huggingface_url);
          if (communityStats) {
            await pool.query(
              `UPDATE ai_models 
               SET community_stats = $1, updated_at = NOW()
               WHERE id = $2`,
              [JSON.stringify(communityStats), modelId]
            );
            result.community_stats = communityStats;
            result.updated_fields.push('community_stats');
            console.log(`[Enrichment] Updated community stats for ${model.name}`);
          }
        } catch (error) {
          const errorMsg = `Failed to fetch community stats: ${(error as Error).message}`;
          result.errors?.push(errorMsg);
          console.error(`[Enrichment] ${errorMsg}`);
        }
      }

      console.log(`[Enrichment] Completed enrichment for ${model.name}`);
      return result;
    } catch (error) {
      result.success = false;
      result.errors?.push((error as Error).message);
      console.error(`[Enrichment] Error enriching model:`, error);
      return result;
    }
  }

  /**
   * Enrich HuggingFace community stats
   */
  private async enrichHuggingFaceCommunity(hfUrl: string): Promise<any | null> {
    try {
      // Extract model ID from URL
      const match = hfUrl.match(/huggingface\.co\/([^\/]+)/);
      if (!match) {
        return null;
      }

      const modelId = match[1];
      const apiUrl = `https://huggingface.co/api/models/${modelId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        downloads: data.downloads || 0,
        likes: data.likes || 0,
        library_name: data.library_name,
        pipeline_tag: data.pipeline_tag,
        tags: data.tags || [],
        last_updated: data.last_modified || null,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[Enrichment] Error fetching HF community stats:`, error);
      return null;
    }
  }

  /**
   * Enrich multiple models (batch processing)
   */
  async enrichModels(modelIds: string[]): Promise<{ [modelId: string]: EnrichmentResult }> {
    const results: { [modelId: string]: EnrichmentResult } = {};

    for (const modelId of modelIds) {
      try {
        results[modelId] = await this.enrichModel(modelId);
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results[modelId] = {
          success: false,
          errors: [(error as Error).message],
          updated_fields: []
        };
      }
    }

    return results;
  }

  /**
   * Enrich all published models
   */
  async enrichAllPublishedModels(): Promise<{ total: number; successful: number; failed: number }> {
    try {
      const modelsResult = await pool.query(
        'SELECT id FROM ai_models WHERE status = $1',
        ['published']
      );

      const modelIds = modelsResult.rows.map(row => row.id);
      const results = await this.enrichModels(modelIds);

      const successful = Object.values(results).filter(r => r.success).length;
      const failed = Object.values(results).filter(r => !r.success).length;

      return {
        total: modelIds.length,
        successful,
        failed
      };
    } catch (error) {
      console.error(`[Enrichment] Error enriching all models:`, error);
      throw error;
    }
  }

  /**
   * Enrich models that need updating (haven't been enriched recently)
   */
  async enrichStaleModels(maxAgeHours: number = 24): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

      const modelsResult = await pool.query(
        `SELECT id FROM ai_models 
         WHERE status = 'published' 
         AND (github_stats IS NULL OR community_stats IS NULL OR updated_at < $1)
         ORDER BY updated_at ASC NULLS FIRST
         LIMIT 50`,
        [cutoffTime]
      );

      const modelIds = modelsResult.rows.map(row => row.id);
      if (modelIds.length === 0) {
        console.log(`[Enrichment] No stale models found`);
        return 0;
      }

      console.log(`[Enrichment] Found ${modelIds.length} stale models to enrich`);
      await this.enrichModels(modelIds);

      return modelIds.length;
    } catch (error) {
      console.error(`[Enrichment] Error enriching stale models:`, error);
      throw error;
    }
  }
}

