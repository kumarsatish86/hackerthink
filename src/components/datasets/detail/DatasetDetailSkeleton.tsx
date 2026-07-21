'use client';

import { Skeleton } from '@/components/ht-ui';

export function DatasetDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8" aria-busy>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function SectionFallback({ label }: { label: string }) {
  return (
    <div className="py-10 text-sm text-[var(--ht-text-muted)]" aria-busy>
      Loading {label}…
    </div>
  );
}
