'use client';

import { FaBookOpen, FaExternalLinkAlt } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { CopyButton } from '@/components/models/ui/CopyButton';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelPaper } from '@/types/models';
import { formatDate } from '../utils';

export function PapersSection({ papers }: { papers: ModelPaper[] }) {
  return (
    <DetailSection id="papers" title="Papers" description="Research publications behind this model">
      {papers.length > 0 ? (
        <div className="space-y-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                  <FaBookOpen className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-[var(--m-text)]">{paper.title}</h3>
                {paper.paper_type && <Badge>{paper.paper_type}</Badge>}
              </div>
              <p className="mb-2 pl-11 text-sm text-[var(--m-text-muted)]">
                {[paper.authors, paper.conference, formatDate(paper.published_at)].filter(Boolean).join(' · ')}
              </p>
              <div className="flex flex-wrap items-center gap-3 pl-11">
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--m-brand)] hover:underline"
                  >
                    <FaExternalLinkAlt className="h-3 w-3" /> Read Paper
                  </a>
                )}
                {paper.bibtex && <CopyButton value={paper.bibtex} label="Copy BibTeX" />}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaBookOpen className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No research papers have been linked to this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default PapersSection;
