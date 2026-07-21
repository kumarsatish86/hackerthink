import type { DatasetCore, DatasetQualityMetric, DatasetStatisticSeries } from '@/types/datasets';
import { toStringArray } from './arrayUtils';

export function deriveQualityHealth(dataset: DatasetCore): DatasetQualityMetric[] {
  const base = dataset.quality_score != null ? Number(dataset.quality_score) : 72;
  const norm = base > 10 ? base : base * 10;
  const biasRisk = /medical|face|biometric|child/i.test(
    `${dataset.domain} ${toStringArray(dataset.tags).join(' ')}`
  )
    ? 55
    : 75;

  return [
    { id: 'completeness', metric_key: 'completeness', label: 'Completeness', value: Math.min(98, norm + 5), source: 'estimated', confidence: 'medium', notes: 'Estimated from catalog metadata.' },
    { id: 'consistency', metric_key: 'consistency', label: 'Consistency', value: Math.min(95, norm), source: 'estimated', confidence: 'low' },
    { id: 'duplicates', metric_key: 'duplicates', label: 'Duplicate Risk (lower better inverted)', value: Math.max(40, 100 - norm / 2), source: 'estimated', confidence: 'low' },
    { id: 'missing', metric_key: 'missing_labels', label: 'Label Coverage', value: Math.min(96, norm + 2), source: 'estimated', confidence: 'medium' },
    { id: 'noise', metric_key: 'noise', label: 'Noise Control', value: Math.min(92, norm - 3), source: 'estimated', confidence: 'low' },
    { id: 'bias', metric_key: 'bias', label: 'Bias / Fairness Proxy', value: biasRisk, source: 'estimated', confidence: 'low', notes: 'Heuristic — not a fairness audit.' },
    { id: 'balance', metric_key: 'class_balance', label: 'Class Balance Proxy', value: Math.min(90, norm - 5), source: 'estimated', confidence: 'low' },
    { id: 'annotation', metric_key: 'annotation_quality', label: 'Annotation Quality', value: Math.min(94, norm), source: 'estimated', confidence: 'medium' },
    { id: 'health', metric_key: 'overall_health', label: 'Overall Data Health', value: Math.round(norm), source: 'estimated', confidence: 'medium' },
  ];
}

export function estimateStatistics(dataset: DatasetCore): DatasetStatisticSeries[] {
  const langs = toStringArray(dataset.languages);
  const tasks = toStringArray(dataset.task_types);
  const classCount = Number(dataset.quick_facts?.classes || dataset.columns || 5);

  const classPoints = Array.from({ length: Math.min(8, classCount) }).map((_, i) => ({
    name: `Class ${i + 1}`,
    value: Math.max(5, Math.round(100 / classCount + ((i * 7) % 13))),
  }));

  const langPoints =
    langs.length > 0
      ? langs.slice(0, 8).map((l, i) => ({ name: l, value: Math.max(5, 40 - i * 4) }))
      : [{ name: dataset.language || 'en', value: 100 }];

  return [
    { id: 'class-dist', series_key: 'class_distribution', label: 'Class Distribution (est.)', points: classPoints, source: 'estimated' },
    { id: 'lang-dist', series_key: 'language_distribution', label: 'Language Distribution (est.)', points: langPoints, source: 'estimated' },
    {
      id: 'label-dist',
      series_key: 'label_distribution',
      label: 'Label / Task Mix (est.)',
      points: (tasks.length ? tasks : ['primary']).slice(0, 6).map((t, i) => ({ name: t, value: 30 + i * 8 })),
      source: 'estimated',
    },
  ];
}
