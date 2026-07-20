import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import {
  classifyHuggingFaceTags,
  flattenFacets,
} from '@/lib/huggingfaceTaxonomy';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

/**
 * Reclassify tags/facets for existing models from stored tags + import_metadata.
 * Useful after taxonomy updates without full HF re-import.
 */
export async function POST() {
  try {
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'ai_models' AND column_name = 'task'
    `);
    const hasTaskColumn = columnCheck.rows.length > 0;

    const result = await pool.query(
      `SELECT id, slug, model_type, license, tags, import_metadata${hasTaskColumn ? ', task' : ''}
       FROM ai_models`
    );

    let updated = 0;
    let failed = 0;
    let taskBackfilled = 0;

    for (const row of result.rows) {
      try {
        let tags: string[] = [];
        if (Array.isArray(row.tags)) tags = row.tags.map(String);
        else if (typeof row.tags === 'string') {
          try {
            const parsed = JSON.parse(row.tags);
            tags = Array.isArray(parsed) ? parsed.map(String) : [];
          } catch {
            tags = [];
          }
        }

        let meta: any = row.import_metadata || {};
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch {
            meta = {};
          }
        }

        if (Array.isArray(meta.tags)) {
          tags = Array.from(new Set([...tags, ...meta.tags.map(String)]));
        }

        const facets = classifyHuggingFaceTags(tags, {
          pipeline_tag: row.model_type || meta.task,
          library_name: meta.library_name,
          license: row.license || meta.license,
        });
        const enrichedTags = Array.from(new Set([...tags, ...flattenFacets(facets)]));

        const nextMeta = {
          ...meta,
          tags: enrichedTags,
          filter_facets: facets,
        };

        // Backfill the `task` column from the derived facets when it's empty,
        // without overwriting a value that was already set explicitly.
        const shouldBackfillTask = hasTaskColumn && !row.task && facets.tasks.length > 0;
        const taskValue = shouldBackfillTask ? facets.tasks[0] : undefined;

        if (hasTaskColumn) {
          await pool.query(
            `UPDATE ai_models
             SET tags = $1::jsonb,
                 categories = $2::jsonb,
                 import_metadata = $3::jsonb,
                 task = COALESCE(task, $4),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [
              JSON.stringify(enrichedTags),
              JSON.stringify(enrichedTags),
              JSON.stringify(nextMeta),
              taskValue || null,
              row.id,
            ]
          );
        } else {
          await pool.query(
            `UPDATE ai_models
             SET tags = $1::jsonb,
                 categories = $2::jsonb,
                 import_metadata = $3::jsonb,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [
              JSON.stringify(enrichedTags),
              JSON.stringify(enrichedTags),
              JSON.stringify(nextMeta),
              row.id,
            ]
          );
        }

        if (shouldBackfillTask) taskBackfilled += 1;
        updated += 1;
      } catch (err) {
        console.error('Facet refresh failed for', row.slug, err);
        failed += 1;
      }
    }

    return NextResponse.json({
      message: `Refreshed facets for ${updated} models${failed ? ` (${failed} failed)` : ''}.`,
      updated,
      failed,
      task_backfilled: taskBackfilled,
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error('Facet refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh facets', details: error?.message },
      { status: 500 }
    );
  }
}
