'use client';

import { DecisionCard } from '@/components/ht-ui';
import type { DecisionAssistant } from '@/lib/models/deriveDecisionAssistant';

export function DecisionAssistantCard({ data }: { data: DecisionAssistant }) {
  const alts = data.alternatives;
  const alternatives = [
    alts.smaller && {
      id: 'smaller',
      label: 'Smaller',
      name: alts.smaller.name,
      slug: alts.smaller.slug,
      why: alts.smaller.why,
    },
    alts.larger && {
      id: 'larger',
      label: 'Larger',
      name: alts.larger.name,
      slug: alts.larger.slug,
      why: alts.larger.why,
    },
    alts.faster && {
      id: 'faster',
      label: 'Faster',
      name: alts.faster.name,
      slug: alts.faster.slug,
      why: alts.faster.why,
    },
    alts.highestAccuracy && {
      id: 'accuracy',
      label: 'Highest accuracy',
      name: alts.highestAccuracy.name,
      slug: alts.highestAccuracy.slug,
      why: alts.highestAccuracy.why,
    },
    alts.multilingual && {
      id: 'multilingual',
      label: 'Multilingual',
      name: alts.multilingual.name,
      slug: alts.multilingual.slug,
      why: alts.multilingual.why,
    },
    ...(alts.better || []).slice(0, 2).map((b, i) => ({
      id: `peer-${i}`,
      label: 'Peer',
      name: b.name,
      slug: b.slug,
      why: b.why,
    })),
  ].filter(Boolean) as {
    id: string;
    label: string;
    name: string;
    slug: string;
    why?: string;
  }[];

  return (
    <DecisionCard
      stars={data.stars}
      recommended={data.recommended.map((r) => ({ id: r.id, label: r.label, why: r.why }))}
      notRecommended={data.notRecommended.map((r) => ({ id: r.id, label: r.label, why: r.why }))}
      alternatives={alternatives}
    />
  );
}
