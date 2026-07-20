'use client';

import { FaLink } from 'react-icons/fa';
import toast from 'react-hot-toast';

export function DetailSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?section=${id}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Section link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 py-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-[var(--m-text)]">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-[var(--m-text-muted)]">{description}</p>}
        </div>
        <button
          type="button"
          onClick={share}
          className="rounded-md border border-[var(--m-border)] p-2 text-[var(--m-text-muted)] hover:text-[var(--m-brand)]"
          aria-label={`Copy link to ${title}`}
        >
          <FaLink />
        </button>
      </div>
      {children}
    </section>
  );
}
