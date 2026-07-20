import React from 'react';
import type { HtTone } from './types';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

const variants: Record<string, string> = {
  primary: 'bg-[var(--ht-brand)] hover:bg-[var(--ht-brand-hover)] text-white',
  secondary: 'bg-[var(--ht-surface-2)] text-[var(--ht-text)] hover:opacity-90',
  ghost: 'bg-transparent hover:bg-[var(--ht-surface-2)] text-[var(--ht-text)]',
  outline:
    'border border-[var(--ht-border)] bg-[var(--ht-surface)] hover:bg-[var(--ht-surface-2)] text-[var(--ht-text)]',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--ht-radius)] border border-[var(--ht-border)] bg-[var(--ht-surface)] shadow-[var(--ht-shadow)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: HtTone;
  className?: string;
}) {
  const tones: Record<HtTone, string> = {
    neutral: 'bg-[var(--ht-surface-2)] text-[var(--ht-text-muted)]',
    brand: 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]',
    success: 'bg-[var(--ht-success-soft)] text-[var(--ht-success)]',
    warning: 'bg-[var(--ht-warning-soft)] text-[var(--ht-warning)]',
    info: 'bg-[var(--ht-info-soft)] text-[var(--ht-info)]',
    danger: 'bg-[var(--ht-danger-soft)] text-[var(--ht-danger)]',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-100 dark:text-slate-900">
        {label}
      </span>
    </span>
  );
}
