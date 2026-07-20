'use client';

import { DeveloperScore } from '@/components/ht-ui';
import type { DeveloperScoreResult } from '@/lib/models/deriveDeveloperScore';

export function DeveloperScoreCard({ data }: { data: DeveloperScoreResult }) {
  return (
    <DeveloperScore
      overall={data.overall}
      max={data.max}
      axes={data.axes.map((a) => ({
        id: a.id,
        name: a.name,
        score: a.score,
        max: a.max,
        why: a.why,
      }))}
    />
  );
}
