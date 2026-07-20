'use client';

import { FaBriefcase, FaIndustry } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelUseCaseCard } from '@/types/models';

export function UseCasesSection({ cards }: { cards: ModelUseCaseCard[] }) {
  return (
    <DetailSection id="use-cases" title="Use Cases" description="Real-world applications across industries">
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                  <FaIndustry className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--m-text-muted)]">{card.industry}</p>
                  {card.title && <p className="font-semibold text-[var(--m-text)]">{card.title}</p>}
                </div>
              </div>
              {card.description && <p className="text-sm text-[var(--m-text-muted)]">{card.description}</p>}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaBriefcase className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No specific use cases have been documented yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default UseCasesSection;
