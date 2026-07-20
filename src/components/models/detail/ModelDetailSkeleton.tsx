'use client';

import { Skeleton } from '@/components/models/ui/primitives';

export function ModelDetailSkeleton() {
  return (
    <div className="models-scope min-h-screen">
      <div className="border-b border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2.5 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="bg-gradient-to-r from-[var(--m-brand)] to-[var(--m-brand-hover)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-5">
          <Skeleton className="h-20 w-20 flex-shrink-0 !bg-white/20" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-8 w-64 !bg-white/20" />
            <Skeleton className="h-4 w-40 !bg-white/20" />
            <Skeleton className="h-4 w-full max-w-xl !bg-white/20" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 !bg-white/20" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 flex-shrink-0" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default ModelDetailSkeleton;
