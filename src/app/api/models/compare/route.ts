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

function parseJson(field: unknown) {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

function asArray(value: unknown): string[] {
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  if (typeof parsed === 'string' && parsed.trim()) {
    return parsed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function pickHardware(model: Record<string, unknown>) {
  const hw = (parseJson(model.hardware_requirements) || {}) as Record<string, unknown>;
  const ideal = (parseJson(model.ideal_hardware) || {}) as Record<string, unknown>;
  const qf = (parseJson(model.quick_facts) || {}) as Record<string, unknown>;
  return {
    gpu_requirement:
      hw.gpu || hw.gpu_requirement || ideal.gpu || qf.gpu_requirement || null,
    ram_requirement: hw.ram || hw.ram_required || ideal.ram || qf.ram_required || null,
    vram_requirement: hw.vram || hw.vram_required || ideal.vram || null,
    cpu_requirement: hw.cpu || hw.cpu_requirement || ideal.cpu || qf.cpu_requirement || null,
    disk_requirement: hw.disk || hw.storage || ideal.disk || null,
  };
}

// GET compare multiple models (by IDs or slugs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');

    if (!ids && !slugs) {
      return NextResponse.json({ error: 'Model IDs or slugs are required' }, { status: 400 });
    }

    let result;
    if (slugs) {
      const slugArray = slugs.split(',').map((s) => s.trim()).filter(Boolean);
      result = await pool.query(
        `SELECT * FROM ai_models WHERE slug = ANY($1::text[]) AND status = 'published'`,
        [slugArray]
      );
    } else {
      const modelIds = ids!.split(',').map((s) => s.trim()).filter(Boolean);
      result = await pool.query(
        `SELECT * FROM ai_models WHERE id = ANY($1::uuid[]) AND status = 'published'`,
        [modelIds]
      );
    }

    const modelIds = result.rows.map((m: { id: string }) => m.id);

    const [benchmarksRes, trainingRes] = await Promise.all([
      modelIds.length
        ? pool.query(
            `SELECT model_id, benchmark_name, score, metric, dataset
             FROM model_benchmarks
             WHERE model_id = ANY($1::uuid[])
             ORDER BY benchmark_name`,
            [modelIds]
          )
        : Promise.resolve({ rows: [] as Record<string, unknown>[] }),
      modelIds.length
        ? pool.query(
            `SELECT model_id, dataset_name, related_dataset_slug
             FROM model_training_data
             WHERE model_id = ANY($1::uuid[])
             ORDER BY dataset_name`,
            [modelIds]
          )
        : Promise.resolve({ rows: [] as Record<string, unknown>[] }),
    ]);

    const benchmarksByModel = new Map<string, Record<string, unknown>[]>();
    for (const row of benchmarksRes.rows) {
      const mid = String(row.model_id);
      if (!benchmarksByModel.has(mid)) benchmarksByModel.set(mid, []);
      benchmarksByModel.get(mid)!.push(row);
    }

    const trainingByModel = new Map<string, { name: string; slug: string | null }[]>();
    for (const row of trainingRes.rows) {
      const mid = String(row.model_id);
      if (!trainingByModel.has(mid)) trainingByModel.set(mid, []);
      trainingByModel.get(mid)!.push({
        name: String(row.dataset_name),
        slug: (row.related_dataset_slug as string) || null,
      });
    }

    // Union of benchmark names across compared models (for dynamic rows)
    const benchmarkNames = Array.from(
      new Set(
        benchmarksRes.rows
          .map((r) => String(r.benchmark_name || '').trim())
          .filter(Boolean)
      )
    ).slice(0, 24);

    const models = result.rows.map((raw: Record<string, unknown>) => {
      const model = { ...raw } as Record<string, unknown>;
      const id = String(model.id);
      const hw = pickHardware(model);
      const training = trainingByModel.get(id) || [];
      const benches = benchmarksByModel.get(id) || [];
      const benchMap: Record<string, number | null> = {};
      for (const b of benches) {
        const name = String(b.benchmark_name);
        const score = b.score != null ? Number(b.score) : null;
        benchMap[name] = Number.isFinite(score as number) ? (score as number) : null;
      }

      const qf = (parseJson(model.quick_facts) || {}) as Record<string, unknown>;
      const community = (parseJson(model.community_stats) || {}) as Record<string, unknown>;
      const github = (parseJson(model.github_stats) || {}) as Record<string, unknown>;

      model.capabilities = asArray(model.capabilities);
      model.categories = asArray(model.categories);
      model.tags = asArray(model.tags);
      model.input_types = asArray(model.input_types);
      model.output_types = asArray(model.output_types);
      model.quantized_versions = asArray(model.quantized_versions);
      model.known_biases = asArray(model.known_biases);
      model.ethical_risks = asArray(model.ethical_risks);
      model.benchmarks = parseJson(model.benchmarks) || {};
      model.community_stats = community;
      model.github_stats = github;
      model.quick_facts = qf;
      model.hardware_requirements = parseJson(model.hardware_requirements) || {};
      model.ideal_hardware = parseJson(model.ideal_hardware) || {};

      // Flattened compare helpers
      model.task_label = model.task || model.model_type || null;
      model.framework_label = model.framework || model.training_framework || null;
      model.param_display = model.parameters || (model.param_count_b != null ? `${model.param_count_b}B` : null);
      model.param_count_numeric =
        model.param_count_b != null
          ? Number(model.param_count_b)
          : parseParamToBillions(model.parameters);
      model.likes_display =
        Number(model.likes_count) || Number(community.likes) || Number(github.stars) || 0;
      model.stars_display =
        Number(model.stars_count) || Number(github.stars) || 0;
      model.github_stars = Number(github.stars) || 0;
      model.github_forks = Number(github.forks) || 0;
      model.training_dataset_count = training.length;
      model.training_datasets = training.map((t) => t.name);
      model.training_datasets_linked = training.filter((t) => t.slug).map((t) => t.name);
      model.benchmark_rows = benchMap;
      model.gpu_requirement = hw.gpu_requirement;
      model.ram_requirement = hw.ram_requirement;
      model.vram_requirement = hw.vram_requirement;
      model.cpu_requirement = hw.cpu_requirement;
      model.disk_requirement = hw.disk_requirement;
      model.inference_speed_label = model.inference_speed || qf.inference_speed || null;
      model.memory_footprint_label = model.memory_footprint || qf.memory_usage || null;
      model.commercial_use_label =
        qf.commercial_use ||
        (typeof model.license === 'string' &&
        /(mit|apache|bsd|cc-by|openrail)/i.test(model.license) &&
        !/(nc|non.?commercial)/i.test(model.license)
          ? 'Likely yes'
          : null);
      model.release_date_label = model.release_date
        ? String(model.release_date).slice(0, 10)
        : null;

      // Dynamic benchmark_* keys for table fields
      for (const name of benchmarkNames) {
        const safeKey = `benchmark__${name}`;
        model[safeKey] = benchMap[name] ?? null;
      }

      return model;
    });

    return NextResponse.json({
      models,
      meta: {
        benchmark_names: benchmarkNames,
      },
    });
  } catch (error) {
    console.error('Error fetching models for comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function parseParamToBillions(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value).trim();
  const m = s.match(/^([\d.]+)\s*([KMBT])?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const u = (m[2] || 'B').toUpperCase();
  if (u === 'T') return n * 1000;
  if (u === 'B') return n;
  if (u === 'M') return n / 1000;
  if (u === 'K') return n / 1e6;
  return n;
}
