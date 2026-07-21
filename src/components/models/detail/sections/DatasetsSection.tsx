'use client';

import Link from 'next/link';
import { FaDatabase, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelTrainingDataset } from '@/types/models';

export function DatasetsSection({ trainingData }: { trainingData: ModelTrainingDataset[] }) {
  return (
    <DetailSection id="datasets" title="Training Data" description="Datasets used to train this model">
      {trainingData.length > 0 ? (
        <div className="space-y-4">
          {trainingData.map((ds) => (
            <Card key={ds.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                  <FaDatabase className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-[var(--m-text)]">
                  {ds.related_dataset_slug ? (
                    <Link
                      href={`/datasets/${ds.related_dataset_slug}`}
                      className="hover:text-[var(--m-brand)] hover:underline"
                    >
                      {ds.dataset_name}
                    </Link>
                  ) : (
                    ds.dataset_name
                  )}
                </h3>
                {ds.dataset_size && <Badge>{ds.dataset_size}</Badge>}
                {ds.license && <Badge tone="brand">{ds.license}</Badge>}
                {ds.quality_score != null && (
                  <Badge tone="success">Quality {ds.quality_score}/10</Badge>
                )}
              </div>
              {ds.description && <p className="mb-2 text-sm text-[var(--m-text-muted)]">{ds.description}</p>}
              {ds.languages && ds.languages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {ds.languages.map((lang, i) => (
                    <Badge key={i}>{lang}</Badge>
                  ))}
                </div>
              )}
              {ds.known_biases && (
                <p className="mb-2 flex items-start gap-1.5 text-sm text-amber-600">
                  <FaExclamationTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {ds.known_biases}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {ds.related_dataset_slug && (
                  <Link
                    href={`/datasets/${ds.related_dataset_slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--m-brand)] hover:underline"
                  >
                    View on HackerThink
                  </Link>
                )}
                {ds.download_url && (
                  <a
                    href={ds.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--m-brand)] hover:underline"
                  >
                    <FaExternalLinkAlt className="h-3 w-3" /> External source
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaDatabase className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">
            Training data details are not available for this model yet.
          </p>
        </Card>
      )}
    </DetailSection>
  );
}

export default DatasetsSection;
