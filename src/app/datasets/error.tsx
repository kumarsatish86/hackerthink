'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ht-ui';

export default function DatasetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Datasets route error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ErrorState
        title="Datasets page failed to load"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={reset}
      />
      <p className="mt-4 text-center text-sm">
        <Link href="/datasets" className="text-[var(--ht-brand)] hover:underline">
          Back to datasets hub
        </Link>
      </p>
    </div>
  );
}
