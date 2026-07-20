'use client';

import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';

export function ModelBreadcrumb({
  modelName,
  category,
}: {
  modelName: string;
  category?: string | null;
}) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2.5 text-sm text-[var(--m-text-muted)] sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-1 whitespace-nowrap hover:text-[var(--m-brand)]">
          <FaHome className="h-3.5 w-3.5" />
          Home
        </Link>
        <FaChevronRight className="h-2.5 w-2.5 flex-shrink-0" />
        <Link href="/models" className="whitespace-nowrap hover:text-[var(--m-brand)]">
          Models
        </Link>
        {category && (
          <>
            <FaChevronRight className="h-2.5 w-2.5 flex-shrink-0" />
            <Link
              href={`/models/category/${encodeURIComponent(category)}`}
              className="whitespace-nowrap capitalize hover:text-[var(--m-brand)]"
            >
              {category}
            </Link>
          </>
        )}
        <FaChevronRight className="h-2.5 w-2.5 flex-shrink-0" />
        <span className="truncate whitespace-nowrap font-medium text-[var(--m-text)]" aria-current="page">
          {modelName}
        </span>
      </div>
    </nav>
  );
}

export default ModelBreadcrumb;
