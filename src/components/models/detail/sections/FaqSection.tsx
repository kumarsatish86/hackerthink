'use client';

import { useMemo } from 'react';
import { FAQAccordion } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore, ModelFaq } from '@/types/models';
import { generatePeopleAlsoAsk } from '@/lib/models/generatePeopleAlsoAsk';

export function FaqSection({ faqs, model }: { faqs: ModelFaq[]; model?: ModelCore }) {
  const items = useMemo(() => {
    if (faqs.length > 0) {
      return [...faqs]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((f) => ({ id: f.id, q: f.question, a: f.answer }));
    }
    if (model) {
      return generatePeopleAlsoAsk(model).map((p) => ({ id: p.id, q: p.question, a: p.answer }));
    }
    return [];
  }, [faqs, model]);

  return (
    <DetailSection
      id="faq"
      title="FAQ"
      description={faqs.length ? 'Frequently asked questions about this model' : 'People also ask'}
    >
      <FAQAccordion items={items} />
    </DetailSection>
  );
}

export default FaqSection;
