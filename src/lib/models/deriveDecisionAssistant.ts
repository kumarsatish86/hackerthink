import type { ModelComparisonPeer, ModelCore, ModelRelatedItem } from '@/types/models';
import { toStringArray } from './arrayUtils';
import { deriveModelScores } from './deriveModelScores';
import { deriveDeveloperScore } from './deriveDeveloperScore';

export type DecisionRating = 'Excellent' | 'Good' | 'Not Recommended';

export type DecisionUseCase = {
  id: string;
  label: string;
  rating: DecisionRating;
  why: string;
};

export type DecisionAlternatives = {
  smaller?: { slug: string; name: string; why?: string };
  larger?: { slug: string; name: string; why?: string };
  faster?: { slug: string; name: string; why?: string };
  multilingual?: { slug: string; name: string; why?: string };
  highestAccuracy?: { slug: string; name: string; why?: string };
  better?: { slug: string; name: string; why?: string }[];
};

export type DecisionAssistant = {
  bestFor: DecisionUseCase[];
  recommended: DecisionUseCase[];
  notRecommended: DecisionUseCase[];
  stars: number;
  alternatives: DecisionAlternatives;
};

const USE_CASE_DEFS: { id: string; label: string; match: RegExp }[] = [
  { id: 'semantic-search', label: 'Semantic Search', match: /search|retrieval|embed/i },
  { id: 'rag', label: 'RAG', match: /rag|retrieval|embed|qa/i },
  { id: 'embeddings', label: 'Embeddings', match: /embed|sentence|vector/i },
  { id: 'recommendation', label: 'Recommendation Systems', match: /recommend|rank|similarity/i },
  { id: 'classification', label: 'Classification', match: /classif|sentiment|zero.?shot/i },
  { id: 'clustering', label: 'Clustering', match: /cluster|embed|similarity/i },
  { id: 'chatbots', label: 'Chatbots', match: /chat|instruct|dialog|llm|text-generation/i },
  { id: 'vector-db', label: 'Vector Database', match: /embed|vector|retriev/i },
];

function haystack(model: ModelCore) {
  return [
    model.task,
    model.model_type,
    model.name,
    ...toStringArray(model.tags),
    ...toStringArray(model.capabilities),
    ...toStringArray(model.use_cases),
  ]
    .filter(Boolean)
    .join(' ');
}

function rate(match: boolean, strong: boolean): DecisionRating {
  if (strong) return 'Excellent';
  if (match) return 'Good';
  return 'Not Recommended';
}

export function deriveDecisionAssistant(
  model: ModelCore,
  peers: ModelComparisonPeer[] = [],
  related: ModelRelatedItem[] = []
): DecisionAssistant {
  const h = haystack(model);
  const scores = deriveModelScores(model);
  const devScore = deriveDeveloperScore(model);
  const bestFor: DecisionUseCase[] = USE_CASE_DEFS.map((uc) => {
    const matched = uc.match.test(h);
    const strong = matched && (scores.production >= 65 || /embed|sentence|mini|bge|e5/i.test(model.name));
    const rating = rate(matched, strong);
    const why =
      rating === 'Excellent'
        ? `${model.name} aligns strongly with ${uc.label} based on task tags and readiness signals.`
        : rating === 'Good'
          ? `${model.name} can support ${uc.label}, though specialized peers may outperform for narrow workloads.`
          : `${model.name} is not primarily positioned for ${uc.label}; consider a task-specialized alternative.`;
    return { id: uc.id, label: uc.label, rating, why };
  });

  const recommended = bestFor.filter((u) => u.rating === 'Excellent' || u.rating === 'Good');
  const notRecommended = bestFor.filter((u) => u.rating === 'Not Recommended');

  const peerOpts = peers
    .filter((p) => p.peer_slug && p.name)
    .map((p) => ({ slug: p.peer_slug!, name: p.name!, parameters: p.parameters || '' }));

  const relatedModels = related
    .filter((r) => r.type === 'model' && r.slug)
    .map((r) => ({ slug: r.slug!, name: r.title, parameters: '' }));

  const pool = [...peerOpts, ...relatedModels];
  const paramsB = model.param_count_b;

  const smaller =
    pool.find((p) => /mini|small|tiny|base/i.test(p.name)) ||
    (paramsB != null
      ? peerOpts.find((p) => /0\.\d|1b|2b|3b|mini|small/i.test(`${p.parameters} ${p.name}`))
      : undefined);

  const larger =
    pool.find((p) => /large|xl|xxl|7b|13b|70b/i.test(p.name)) ||
    peerOpts.find((p) => /large|xl|7b|13b/i.test(`${p.parameters} ${p.name}`));

  const faster = pool.find((p) => /mini|fast|tiny|distil|lite/i.test(p.name)) || smaller;
  const multilingual = pool.find((p) => /multi|mbert|xlm|nllb|mistral|qwen/i.test(p.name));
  const highestAccuracy =
    pool.find((p) => /large|xl|instruct|pro|ultra/i.test(p.name)) || larger;

  const withWhy = <T extends { slug: string; name: string }>(
    item: T | undefined,
    why: string
  ): (T & { why: string }) | undefined => (item ? { ...item, why } : undefined);

  return {
    bestFor,
    recommended,
    notRecommended,
    stars: devScore.stars,
    alternatives: {
      smaller: withWhy(smaller, 'Lower resource footprint for edge or high-QPS paths.'),
      larger: withWhy(larger, 'More capacity when quality outweighs latency/cost.'),
      faster: withWhy(faster, 'Prefer when p95 latency dominates the SLA.'),
      multilingual: withWhy(multilingual, 'Better coverage across languages/scripts.'),
      highestAccuracy: withWhy(highestAccuracy, 'Choose when benchmark quality is the priority.'),
      better: pool.slice(0, 4).map((p) => ({
        slug: p.slug,
        name: p.name,
        why: 'Peer frequently compared for similar workloads.',
      })),
    },
  };
}
