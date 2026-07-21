'use client';

import Link from 'next/link';
import { FaEnvelopeOpenText, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';

export function DatasetMonetizationSlots({
  variant = 'both',
}: {
  variant?: 'newsletter' | 'courses' | 'both';
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(variant === 'newsletter' || variant === 'both') && (
          <Card className="flex items-center gap-4 border-dashed p-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
              <FaEnvelopeOpenText />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--m-text)]">Dataset drops</p>
              <p className="text-xs text-[var(--m-text-muted)]">
                New catalogs, licenses, and benchmark sets in your inbox.
              </p>
            </div>
            <Link href="/subscribe" className="flex-shrink-0 text-sm font-medium text-[var(--m-brand)] hover:underline">
              Subscribe <FaArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </Card>
        )}
        {(variant === 'courses' || variant === 'both') && (
          <Card className="flex items-center gap-4 border-dashed p-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
              <FaGraduationCap />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--m-text)]">Learn data pipelines</p>
              <p className="text-xs text-[var(--m-text-muted)]">
                Courses on labeling, preprocessing, and training loops.
              </p>
            </div>
            <Link href="/courses" className="flex-shrink-0 text-sm font-medium text-[var(--m-brand)] hover:underline">
              Browse Courses <FaArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DatasetMonetizationSlots;
