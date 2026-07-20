'use client';

import { FaHistory, FaCodeBranch } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelChangelogEntry, ModelVersion } from '@/types/models';
import { formatDate } from '../utils';

const TYPE_TONE: Record<string, 'success' | 'warning' | 'brand' | 'neutral'> = {
  feature: 'success',
  fix: 'warning',
  breaking: 'warning',
  improvement: 'brand',
  release: 'brand',
};

export function ChangelogSection({
  changelog,
  versions = [],
}: {
  changelog: ModelChangelogEntry[];
  versions?: ModelVersion[];
}) {
  const hasChangelog = changelog.length > 0;
  const hasVersions = versions.length > 0;

  return (
    <DetailSection id="changelog" title="Changelog" description="Version history and release notes">
      {hasChangelog ? (
        <div className="relative space-y-6 border-l-2 border-[var(--m-border)] pl-6">
          {changelog.map((entry) => (
            <div key={entry.id} className="relative">
              <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--m-brand)]" />
              <Card className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {entry.version && (
                    <Badge tone="brand">
                      <FaCodeBranch className="mr-1 inline h-2.5 w-2.5" /> v{entry.version}
                    </Badge>
                  )}
                  {entry.change_type && (
                    <Badge tone={TYPE_TONE[entry.change_type.toLowerCase()] || 'neutral'} className="capitalize">
                      {entry.change_type}
                    </Badge>
                  )}
                  <span className="text-xs text-[var(--m-text-muted)]">{formatDate(entry.released_at)}</span>
                </div>
                {entry.title && <h3 className="mb-1 font-semibold text-[var(--m-text)]">{entry.title}</h3>}
                {entry.body && <p className="text-sm text-[var(--m-text-muted)]">{entry.body}</p>}
              </Card>
            </div>
          ))}
        </div>
      ) : hasVersions ? (
        <div className="space-y-3">
          {versions.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone="brand">v{v.version}</Badge>
                {v.is_latest && <Badge tone="success">Latest</Badge>}
                <span className="text-xs text-[var(--m-text-muted)]">{formatDate(v.release_date)}</span>
              </div>
              {v.changelog && <p className="text-sm text-[var(--m-text-muted)]">{v.changelog}</p>}
              {v.breaking_changes && (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">Breaking: {v.breaking_changes}</p>
              )}
              {v.migration_guide && (
                <p className="mt-1 text-sm text-[var(--m-text-muted)]">Migration: {v.migration_guide}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaHistory className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No changelog entries have been published yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default ChangelogSection;
