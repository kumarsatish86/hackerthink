'use client';

import { FaGraduationCap, FaVideo, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelTutorial } from '@/types/models';

const DIFFICULTY_TONE: Record<string, 'success' | 'warning' | 'brand' | 'neutral'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'brand',
};

export function TutorialsSection({ tutorials }: { tutorials: ModelTutorial[] }) {
  return (
    <DetailSection id="tutorials" title="Tutorials" description="Guided walkthroughs to help you get productive">
      {tutorials.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tutorials.map((tutorial) => {
            const content = (
              <Card className="h-full p-4 transition hover:border-[var(--m-brand)]">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                    {tutorial.is_video ? <FaVideo className="h-3.5 w-3.5" /> : <FaFileAlt className="h-3.5 w-3.5" />}
                  </span>
                  <h3 className="font-semibold text-[var(--m-text)]">{tutorial.title}</h3>
                </div>
                {tutorial.description && <p className="mb-2 text-sm text-[var(--m-text-muted)]">{tutorial.description}</p>}
                <div className="flex items-center gap-2">
                  {tutorial.difficulty && (
                    <Badge tone={DIFFICULTY_TONE[tutorial.difficulty.toLowerCase()] || 'neutral'} className="capitalize">
                      {tutorial.difficulty}
                    </Badge>
                  )}
                  {tutorial.url && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-[var(--m-brand)]">
                      Open <FaExternalLinkAlt className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </Card>
            );
            return tutorial.url ? (
              <a key={tutorial.id} href={tutorial.url} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={tutorial.id}>{content}</div>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaGraduationCap className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No tutorials have been published for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default TutorialsSection;
