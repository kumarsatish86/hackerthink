import type { DatasetCore } from '@/types/datasets';
import { toStringArray } from './arrayUtils';
import { commercialFriendly, computeFreshnessScore, computePopularityScore } from './estimateHardware';

export type DeveloperScoreAxis = {
  id: string;
  name: string;
  score: number;
  max: number;
  why: string;
};

export type DeveloperScoreResult = {
  overall: number;
  max: number;
  axes: DeveloperScoreAxis[];
  stars: number;
};

function clamp(n: number) {
  return Math.max(0, Math.min(10, Number(n.toFixed(1))));
}

export function deriveDeveloperScore(dataset: DatasetCore): DeveloperScoreResult {
  const docs = Boolean(dataset.full_description || dataset.description || dataset.documentation_url);
  const pop = computePopularityScore(dataset);
  const fresh = computeFreshnessScore(dataset);
  const commercial = commercialFriendly(dataset);
  const q = dataset.quality_score != null ? Number(dataset.quality_score) : 6;
  const hasAnnot = Boolean(dataset.annotation_guide) || /coco|yolo|ner|bbox/i.test(
    `${dataset.format} ${toStringArray(dataset.tags).join(' ')}`
  );

  const axes: DeveloperScoreAxis[] = [
    {
      id: 'documentation',
      name: 'Documentation',
      score: clamp(docs ? 8.5 : 4.5),
      max: 10,
      why: docs ? 'Description or docs URL present.' : 'Sparse docs — lean on Explorer and papers.',
    },
    {
      id: 'quality',
      name: 'Data Quality',
      score: clamp(q > 10 ? q / 10 : q),
      max: 10,
      why: 'From quality_score or heuristic health.',
    },
    {
      id: 'popularity',
      name: 'Popularity',
      score: clamp(pop / 10),
      max: 10,
      why: `Popularity signal ${pop}/100.`,
    },
    {
      id: 'community',
      name: 'Community',
      score: clamp(((dataset.download_count || 0) > 10000 ? 8 : 5.5)),
      max: 10,
      why: 'Inferred from downloads/views.',
    },
    {
      id: 'annotations',
      name: 'Annotations',
      score: clamp(hasAnnot ? 8.2 : 5),
      max: 10,
      why: hasAnnot ? 'Annotation format signals detected.' : 'Annotation richness unclear.',
    },
    {
      id: 'commercial',
      name: 'Commercial Use',
      score: clamp(commercial ? 9 : 4),
      max: 10,
      why: dataset.license ? `License: ${dataset.license}` : 'License unclear.',
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      score: clamp(fresh / 10),
      max: 10,
      why: `Freshness ${fresh}/100.`,
    },
    {
      id: 'update-frequency',
      name: 'Update Frequency',
      score: clamp(dataset.last_updated ? fresh / 10 : 4),
      max: 10,
      why: dataset.last_updated ? 'Last updated timestamp present.' : 'No update signal.',
    },
    {
      id: 'ease-training',
      name: 'Ease of Training',
      score: clamp(dataset.format || dataset.huggingface_url ? 8 : 5.5),
      max: 10,
      why: 'Based on format and HF/download availability.',
    },
  ];

  const overall = clamp(axes.reduce((s, a) => s + a.score, 0) / axes.length);
  return {
    overall,
    max: 10,
    axes,
    stars: Math.max(1, Math.min(5, Math.round(overall / 2))),
  };
}
