/**
 * @deprecated Use ModelDetailView via the RSC page at /models/[slug].
 * Kept as a thin client fallback that fetches the v2 payload.
 */
'use client';

import { useEffect, useState } from 'react';
import type { ModelDetailPayload } from '@/types/models';
import { ModelDetailView } from '@/components/models/detail/ModelDetailView';
import { ModelDetailSkeleton } from '@/components/models/detail/ModelDetailSkeleton';
import { ModelsThemeProvider } from '@/components/models/ModelsThemeProvider';
import '@/styles/models.css';

export default function ModelDetailClient({ slug }: { slug: string }) {
  const [data, setData] = useState<ModelDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/models/${slug}`);
        if (!res.ok) throw new Error('Model not found');
        const json = await res.json();
        if (!cancelled) setData(json as ModelDetailPayload);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  if (!data) {
    return (
      <ModelsThemeProvider>
        <div className="models-scope min-h-screen p-6">
          <ModelDetailSkeleton />
        </div>
      </ModelsThemeProvider>
    );
  }

  return (
    <ModelsThemeProvider>
      <ModelDetailView initialData={data} />
    </ModelsThemeProvider>
  );
}
