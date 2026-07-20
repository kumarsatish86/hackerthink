'use client';

import { FaCode } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelApiDoc } from '@/types/models';

export function ApiDocsSection({ docs }: { docs: ModelApiDoc[] }) {
  return (
    <DetailSection id="api-docs" title="API Docs" description="Endpoints, parameters, and request/response formats">
      {docs.length > 0 ? (
        <div className="space-y-4">
          {docs.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                  <FaCode className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-[var(--m-text)]">{doc.title || doc.doc_type}</h3>
                <Badge>{doc.doc_type}</Badge>
              </div>
              {doc.content && <p className="mb-3 pl-11 text-sm text-[var(--m-text-muted)]">{doc.content}</p>}
              {doc.code && <CodeBlock code={doc.code} language={doc.language || 'json'} title={doc.title || doc.doc_type} />}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaCode className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">API documentation is not available for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default ApiDocsSection;
