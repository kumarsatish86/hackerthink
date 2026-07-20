import type { ModelCore, ModelDownloadAnalytics, ModelTrainingDataset } from '@/types/models';
import { deriveModelScores } from './deriveModelScores';
import { formatCompactNumber, formatDate } from './arrayUtils';
import { estimateHardware } from './estimateBenchmarks';

export type QuickStatItem = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  estimated?: boolean;
};

export function buildQuickStats(
  model: ModelCore,
  analytics?: ModelDownloadAnalytics | null,
  trainingData?: ModelTrainingDataset[]
): QuickStatItem[] {
  const qf: Record<string, unknown> = model.quick_facts || {};
  const scores = deriveModelScores(model, analytics);
  const hw = estimateHardware(model);
  const trainingLabel =
    trainingData?.find((t) => t.dataset_name)?.dataset_name ||
    (typeof qf.training_dataset === 'string' ? qf.training_dataset : null) ||
    (typeof (qf as { training_data?: string }).training_data === 'string'
      ? (qf as { training_data?: string }).training_data
      : null);

  const communitySize =
    model.likes_count ||
    model.stars_count ||
    model.rating_count ||
    (typeof (model.community_stats as { members?: number } | null)?.members === 'number'
      ? (model.community_stats as { members: number }).members
      : null);

  const items: (QuickStatItem | null)[] = [
    { id: 'downloads', label: 'Downloads', value: formatCompactNumber(model.download_count || analytics?.total) },
    model.parameters || model.param_count_b != null
      ? {
          id: 'params',
          label: 'Parameters',
          value: model.parameters || `${model.param_count_b}B`,
        }
      : null,
    qf.model_size || model.memory_footprint || hw.memory
      ? {
          id: 'size',
          label: 'Model Size',
          value: String(qf.model_size || model.memory_footprint || hw.memory),
          estimated: Boolean(hw.estimated && !qf.model_size && !model.memory_footprint),
        }
      : null,
    hw.memory
      ? {
          id: 'memory',
          label: 'Memory',
          value: hw.memory,
          estimated: hw.estimated,
          hint: hw.estimated ? 'Estimated from parameter count' : undefined,
        }
      : null,
    hw.vram
      ? {
          id: 'vram',
          label: 'VRAM',
          value: hw.vram,
          estimated: true,
          hint: 'Estimated fp16 footprint',
        }
      : null,
    trainingLabel
      ? { id: 'training', label: 'Training Dataset', value: String(trainingLabel) }
      : { id: 'training', label: 'Training Dataset', value: 'See Training Data section', hint: 'Details below when listed' },
    communitySize
      ? {
          id: 'community',
          label: 'Community',
          value: formatCompactNumber(communitySize),
          hint: 'Likes / stars / ratings signal',
        }
      : {
          id: 'community',
          label: 'Community',
          value: formatCompactNumber(model.download_count || analytics?.total || 0),
          hint: 'Proxy via downloads',
          estimated: true,
        },
    qf.accuracy && /dim|embed/i.test(String(qf.accuracy))
      ? { id: 'embed-dim', label: 'Embedding Dimension', value: String(qf.accuracy) }
      : model.quick_facts?.['embedding_dimension']
        ? { id: 'embed-dim', label: 'Embedding Dimension', value: String(model.quick_facts['embedding_dimension']) }
        : null,
    model.context_length
      ? { id: 'context', label: 'Context Length', value: formatCompactNumber(model.context_length) }
      : null,
    model.inference_speed || qf.inference_speed
      ? { id: 'speed', label: 'Inference Speed', value: String(model.inference_speed || qf.inference_speed) }
      : null,
    qf['latency'] ? { id: 'latency', label: 'Latency', value: String(qf['latency']) } : null,
    model.license || qf.license
      ? { id: 'license', label: 'License', value: String(model.license || qf.license) }
      : null,
    model.framework || qf.framework
      ? { id: 'framework', label: 'Framework', value: String(model.framework || qf.framework) }
      : null,
    model.architecture || qf.architecture
      ? { id: 'architecture', label: 'Architecture', value: String(model.architecture || qf.architecture) }
      : null,
    model.release_date
      ? { id: 'released', label: 'Release Date', value: formatDate(model.release_date) || model.release_date }
      : null,
    model.last_updated
      ? { id: 'updated', label: 'Last Updated', value: formatDate(model.last_updated) || model.last_updated }
      : null,
    model.developer ? { id: 'developer', label: 'Developer', value: model.developer } : null,
    { id: 'trending', label: 'Trending Score', value: `${scores.trending}/100` },
    { id: 'popularity', label: 'Popularity Score', value: `${scores.popularity}/100` },
    { id: 'production', label: 'Production Ready Score', value: `${scores.production}/100` },
    {
      id: 'commercial',
      label: 'Commercial Friendly',
      value: scores.commercialFriendly ? 'Yes' : 'Review license',
    },
    {
      id: 'beginner',
      label: 'Beginner Friendly',
      value: scores.beginnerFriendly ? 'Yes' : 'Intermediate+',
    },
    { id: 'cpu', label: 'CPU Friendly', value: scores.cpuFriendly ? 'Yes' : 'GPU preferred' },
    { id: 'gpu', label: 'GPU Friendly', value: scores.gpuFriendly ? 'Yes' : 'Optional' },
  ];

  return items.filter((x): x is QuickStatItem => Boolean(x && x.value && x.value !== '—'));
}
