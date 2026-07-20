import Link from 'next/link';
import type { HtTone } from './types';

export type TagPillProps = {
  id?: string;
  label: string;
  tone?: HtTone;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
};

const tones: Record<HtTone, string> = {
  neutral: 'bg-[var(--ht-surface-2)] text-[var(--ht-text-muted)]',
  brand: 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]',
  success: 'bg-[var(--ht-success-soft)] text-[var(--ht-success)]',
  warning: 'bg-[var(--ht-warning-soft)] text-[var(--ht-warning)]',
  info: 'bg-[var(--ht-info-soft)] text-[var(--ht-info)]',
  danger: 'bg-[var(--ht-danger-soft)] text-[var(--ht-danger)]',
};

export function TagPill({ id, label, tone = 'neutral', href, icon, className = '' }: TagPillProps) {
  const cls = `inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`;
  if (href) {
    return (
      <Link id={id} href={href} className={cls}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <span id={id} className={cls}>
      {icon}
      {label}
    </span>
  );
}
