import type { ModelCore } from '@/types/models';

export type EstimatedBenchmark = {
  id: string;
  name: string;
  score: number;
  source: 'estimated';
  confidence: 'low' | 'medium';
  hint: string;
};

/**
 * Deterministic estimated benchmarks when DB has none.
 * Labeled estimated — never presented as official.
 */
export function estimateBenchmarks(model: ModelCore): EstimatedBenchmark[] {
  const params = model.param_count_b ?? 0.1;
  const task = `${model.task || ''} ${model.model_type || ''} ${model.name}`.toLowerCase();
  const isEmbed = /embed|sentence|feature-extraction|similarity/.test(task);
  const base = Math.min(92, 55 + Math.log10(Math.max(params, 0.01) + 1) * 12);

  if (isEmbed) {
    return [
      {
        id: 'mteb-est',
        name: 'MTEB (est.)',
        score: Number((base + 4).toFixed(1)),
        source: 'estimated',
        confidence: 'medium',
        hint: 'Estimated from parameter scale and embedding task tags.',
      },
      {
        id: 'retrieval-est',
        name: 'Retrieval nDCG (est.)',
        score: Number((base - 2).toFixed(1)),
        source: 'estimated',
        confidence: 'low',
        hint: 'Heuristic retrieval quality — verify with your corpus.',
      },
      {
        id: 'sts-est',
        name: 'STS Spearman (est.)',
        score: Number((base + 1).toFixed(1)),
        source: 'estimated',
        confidence: 'medium',
        hint: 'Sentence similarity estimate for planning only.',
      },
      {
        id: 'latency-est',
        name: 'CPU latency score (est.)',
        score: Number((Math.max(40, 95 - params * 8)).toFixed(1)),
        source: 'estimated',
        confidence: 'low',
        hint: 'Higher is faster-relative; not wall-clock ms.',
      },
    ];
  }

  return [
    {
      id: 'quality-est',
      name: 'Task quality (est.)',
      score: Number(base.toFixed(1)),
      source: 'estimated',
      confidence: 'low',
      hint: 'Generic quality estimate from size/task — replace with official scores when available.',
    },
    {
      id: 'speed-est',
      name: 'Speed index (est.)',
      score: Number((Math.max(35, 90 - params * 5)).toFixed(1)),
      source: 'estimated',
      confidence: 'low',
      hint: 'Relative speed heuristic.',
    },
    {
      id: 'efficiency-est',
      name: 'Efficiency (est.)',
      score: Number(((base + (90 - params * 5)) / 2).toFixed(1)),
      source: 'estimated',
      confidence: 'low',
      hint: 'Quality/speed blend for planning.',
    },
  ];
}

export function estimateHardware(model: ModelCore): {
  memory?: string;
  vram?: string;
  estimated: boolean;
} {
  const params = model.param_count_b;
  if (params == null) {
    return { memory: model.memory_footprint || undefined, vram: undefined, estimated: false };
  }
  // Rough fp16 footprint
  const gb = Math.max(0.1, params * 2 * 1.2);
  return {
    memory: model.memory_footprint || `~${gb.toFixed(1)} GB (fp16 est.)`,
    vram: `~${Math.max(1, Math.ceil(gb)).toFixed(0)} GB (fp16 est.)`,
    estimated: !model.memory_footprint,
  };
}
