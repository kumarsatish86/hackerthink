import type { DatasetComparisonPeer, DatasetCore } from '@/types/datasets';
import { toStringArray } from './arrayUtils';
import { commercialFriendly, computePopularityScore } from './estimateHardware';

export type DecisionListItem = { id: string; label: string; why: string };

export type DatasetDecision = {
  stars: number;
  recommended: DecisionListItem[];
  notRecommended: DecisionListItem[];
  alternatives: { id: string; label: string; name: string; slug: string; why?: string }[];
};

const USE_CASES: { id: string; label: string; match: RegExp }[] = [
  { id: 'image-clf', label: 'Image Classification', match: /image.?class|vision|imagenet|cifar/i },
  { id: 'obj-det', label: 'Object Detection', match: /detect|coco|bbox|yolo/i },
  { id: 'semantic', label: 'Semantic Search', match: /retriev|search|embed|qa/i },
  { id: 'finetune', label: 'Fine-tuning', match: /instruct|sft|finetune|nlp|text/i },
  { id: 'llm', label: 'LLM Training', match: /pretrain|corpus|crawl|wiki|llm/i },
  { id: 'rag', label: 'RAG', match: /rag|retriev|passage|document/i },
  { id: 'speech', label: 'Speech Recognition', match: /speech|asr|audio|voice/i },
  { id: 'ocr', label: 'OCR', match: /ocr|document.?layout|text.?detect/i },
  { id: 'medical', label: 'Medical AI', match: /medical|clinical|radiolog|patholog/i },
  { id: 'cyber', label: 'Cybersecurity', match: /malware|threat|security|network.?log/i },
];

export function deriveDecisionAssistant(
  dataset: DatasetCore,
  peers: DatasetComparisonPeer[] = []
): DatasetDecision {
  const hay = [
    dataset.name,
    dataset.dataset_type,
    dataset.modality,
    dataset.domain,
    ...toStringArray(dataset.task_types),
    ...toStringArray(dataset.tags),
    ...toStringArray(dataset.categories),
  ]
    .filter(Boolean)
    .join(' ');

  const recommended: DecisionListItem[] = [];
  const notRecommended: DecisionListItem[] = [];

  for (const uc of USE_CASES) {
    const hit = uc.match.test(hay);
    if (hit) {
      recommended.push({
        id: uc.id,
        label: uc.label,
        why: `${dataset.name} tags/task metadata align with ${uc.label}.`,
      });
    } else if (/medical|clinical/i.test(uc.label) || /edge/i.test(uc.label)) {
      notRecommended.push({
        id: uc.id,
        label: uc.label,
        why: `${dataset.name} is not primarily positioned for ${uc.label}; prefer a specialized corpus.`,
      });
    }
  }

  if (!notRecommended.length) {
    notRecommended.push(
      {
        id: 'sensitive-prod',
        label: 'Highly Sensitive Production',
        why: 'Validate labels, PII, and license before regulated production use.',
      },
      {
        id: 'edge',
        label: 'Small Edge Devices',
        why: 'Full corpora often exceed edge storage/RAM — use distilled subsets.',
      }
    );
  }

  if (!recommended.length) {
    recommended.push({
      id: 'general',
      label: dataset.dataset_type || 'General ML',
      why: 'Use when you need a catalogued public dataset for experimentation.',
    });
  }

  const pop = computePopularityScore(dataset);
  const stars = Math.max(1, Math.min(5, Math.round(pop / 20)));

  const alternatives = peers
    .filter((p) => p.peer_slug && p.name)
    .slice(0, 5)
    .map((p, i) => ({
      id: `alt-${i}`,
      label: i === 0 ? 'Alternative' : 'Peer',
      name: p.name!,
      slug: p.peer_slug!,
      why: p.notes || 'Frequently compared for similar tasks.',
    }));

  if (!alternatives.length) {
    const seeds = [
      { slug: 'coco', name: 'COCO', label: 'Vision' },
      { slug: 'imagenet', name: 'ImageNet', label: 'Classification' },
      { slug: 'open-images', name: 'Open Images', label: 'Detection' },
    ];
    for (const s of seeds) {
      if (!hay.toLowerCase().includes(s.name.toLowerCase())) {
        alternatives.push({
          id: s.slug,
          label: s.label,
          name: s.name,
          slug: s.slug,
          why: 'Common catalog peer — search HackerThink for exact slug.',
        });
      }
    }
  }

  void commercialFriendly;
  return { stars, recommended: recommended.slice(0, 6), notRecommended: notRecommended.slice(0, 4), alternatives };
}
