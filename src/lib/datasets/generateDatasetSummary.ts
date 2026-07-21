import type { DatasetAiSummary, DatasetCore } from '@/types/datasets';
import { toStringArray } from './arrayUtils';
import { commercialFriendly } from './estimateHardware';

export function generateDatasetSummary(dataset: DatasetCore): string {
  const tasks = toStringArray(dataset.task_types).join(', ') || dataset.dataset_type || 'machine learning';
  const provider = dataset.provider || 'the community';
  const size = dataset.size || (dataset.rows != null ? `${dataset.rows} samples` : 'published size');
  const license = dataset.license || 'its published license';
  return `${dataset.name} is an AI dataset from ${provider} oriented toward ${tasks}. It is listed at ${size} under ${license}. Use Overview, Explorer, and Download sections to evaluate fit before training.`;
}

export function resolveDatasetDescription(dataset: DatasetCore): string {
  const body = (dataset.full_description || dataset.description || '').trim();
  if (body && !/^no description available$/i.test(body)) return body;
  return generateDatasetSummary(dataset);
}

export function buildFallbackAiSummary(dataset: DatasetCore): DatasetAiSummary {
  const tasks = toStringArray(dataset.task_types);
  const commercial = commercialFriendly(dataset);
  return {
    what: generateDatasetSummary(dataset),
    who: 'ML engineers, researchers, and applied AI teams evaluating training or evaluation corpora.',
    when_to_use: tasks.length
      ? `When you need a ${tasks[0]} corpus matching ${dataset.modality || dataset.dataset_type || 'this modality'}.`
      : 'When you need a documented public corpus for experimentation or benchmarking.',
    when_not_to_use:
      'Avoid high-stakes clinical, legal, or safety-critical deployment without independent validation and compliance review.',
    advantages: [
      dataset.license ? `Published under ${dataset.license}` : 'Publicly catalogued with download links',
      dataset.rows ? `Sample scale ~${dataset.rows}` : 'Structured for ML workflows',
      commercial ? 'License leans commercial-friendly' : 'Clear license field for compliance review',
    ],
    limitations: [
      'Always verify label quality on your own holdout set',
      'Preview samples may be capped; full corpus requires download',
      'Bias and PII risk depend on collection method — review Security notes',
    ],
    ideal_use_cases: tasks.length ? tasks : ['Fine-tuning', 'Benchmarking', 'Research'],
    difficulty: dataset.rows && dataset.rows > 1_000_000 ? 'advanced' : 'intermediate',
    beginner_summary: `${dataset.name} is a ready-to-explore dataset. Start with Sample Preview and Download.`,
    expert_summary: resolveDatasetDescription(dataset).slice(0, 600),
    commercial_suitability: commercial
      ? 'Likely suitable for commercial use pending license review.'
      : 'Review license and redistribution terms before commercial use.',
    recommended_tasks: tasks,
  };
}
