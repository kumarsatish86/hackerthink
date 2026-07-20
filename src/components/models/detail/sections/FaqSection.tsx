'use client';

import { useState } from 'react';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelFaq } from '@/types/models';

export function FaqSection({ faqs }: { faqs: ModelFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const sorted = [...faqs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <DetailSection id="faq" title="FAQ" description="Frequently asked questions about this model">
      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <Card key={faq.id} className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-[var(--m-text)]">{faq.question}</span>
                  <FaChevronDown
                    className={`h-3.5 w-3.5 flex-shrink-0 text-[var(--m-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--m-border)] px-4 py-3 text-sm text-[var(--m-text-muted)]">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaQuestionCircle className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No FAQs have been added for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default FaqSection;
