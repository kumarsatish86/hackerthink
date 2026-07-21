/**
 * @deprecated Prefer DatasetDetailView via SSR page.
 * Thin client wrapper kept for any legacy imports.
 */
'use client';

import { useEffect, useState } from 'react';
import { DatasetDetailView } from './detail/DatasetDetailView';
import { DatasetDetailSkeleton } from './detail/DatasetDetailSkeleton';
import type { DatasetDetailPayload } from '@/types/datasets';

export default function DatasetDetailClient({ slug }: { slug: string }) {
  const [payload, setPayload] = useState<DatasetDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/datasets/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPayload(data.payload || null);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return <div className="mx-auto max-w-7xl p-8 text-sm text-red-600">{error}</div>;
  }
  if (!payload) return <DatasetDetailSkeleton />;
  return <DatasetDetailView initialData={payload} />;
}
