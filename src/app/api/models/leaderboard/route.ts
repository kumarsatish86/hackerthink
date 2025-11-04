import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// GET leaderboard of top models by benchmarks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const benchmark = searchParams.get('benchmark'); // Specific benchmark name
    const category = searchParams.get('category'); // Benchmark category
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sort_by') || 'score'; // score, downloads, rating

    let query = `
      SELECT 
        m.id, m.name, m.slug, m.developer, m.model_type, m.parameters,
        m.architecture, m.license, m.rating, m.rating_count, m.download_count,
        m.logo_url, m.created_at,
        mb.benchmark_name, mb.score, mb.category, mb.metric_type,
        mb.dataset_name, mb.evaluation_date
      FROM ai_models m
      INNER JOIN model_benchmarks mb ON m.id = mb.model_id
      WHERE m.status = 'published'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by specific benchmark
    if (benchmark) {
      query += ` AND mb.benchmark_name = $${paramIndex}`;
      params.push(benchmark);
      paramIndex++;
    }

    // Filter by benchmark category
    if (category) {
      query += ` AND mb.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Sorting
    if (sortBy === 'score') {
      query += ` ORDER BY mb.score DESC NULLS LAST, m.download_count DESC`;
    } else if (sortBy === 'downloads') {
      query += ` ORDER BY m.download_count DESC, mb.score DESC NULLS LAST`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY m.rating DESC, mb.score DESC NULLS LAST`;
    } else {
      query += ` ORDER BY mb.score DESC NULLS LAST`;
    }

    query += ` LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    // Group results by model and aggregate benchmark scores
    const modelMap = new Map<string, any>();
    
    result.rows.forEach((row: any) => {
      if (!modelMap.has(row.id)) {
        modelMap.set(row.id, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          developer: row.developer,
          model_type: row.model_type,
          parameters: row.parameters,
          architecture: row.architecture,
          license: row.license,
          rating: row.rating,
          rating_count: row.rating_count,
          download_count: row.download_count,
          logo_url: row.logo_url,
          benchmarks: [],
          bestScores: {}
        });
      }
      
      const model = modelMap.get(row.id);
      model.benchmarks.push({
        benchmark_name: row.benchmark_name,
        score: row.score,
        category: row.category,
        metric_type: row.metric_type,
        dataset_name: row.dataset_name,
        evaluation_date: row.evaluation_date
      });

      // Track best score for each benchmark
      if (!model.bestScores[row.benchmark_name] || 
          (row.score && parseFloat(row.score) > parseFloat(model.bestScores[row.benchmark_name] || 0))) {
        model.bestScores[row.benchmark_name] = row.score;
      }
    });

    const leaderboard = Array.from(modelMap.values());

    // Get available benchmark categories for filters
    const categoriesResult = await pool.query(`
      SELECT DISTINCT category 
      FROM model_benchmarks 
      WHERE category IS NOT NULL 
      ORDER BY category
    `);

    // Get available benchmark names for filters
    const benchmarksResult = await pool.query(`
      SELECT DISTINCT benchmark_name 
      FROM model_benchmarks 
      ORDER BY benchmark_name
    `);

    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
      filterOptions: {
        categories: categoriesResult.rows.map(r => r.category).filter(Boolean),
        benchmarks: benchmarksResult.rows.map(r => r.benchmark_name).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: (error as Error).message },
      { status: 500 }
    );
  }
}

