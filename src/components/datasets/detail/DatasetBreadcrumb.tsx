import Link from 'next/link';

export function DatasetBreadcrumb({
  name,
  category,
}: {
  name: string;
  category?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-3 text-sm sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[var(--ht-text-muted)]">
        <li>
          <Link href="/" className="hover:text-[var(--ht-brand)]">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href="/datasets" className="hover:text-[var(--ht-brand)]">
            Datasets
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/datasets/category/${encodeURIComponent(category)}`}
                className="hover:text-[var(--ht-brand)]"
              >
                {category}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden>/</li>
        <li className="font-medium text-[var(--ht-text)]">{name}</li>
      </ol>
    </nav>
  );
}
