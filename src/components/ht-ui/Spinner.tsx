export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
};

const sizeMap = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-8 w-8 border-[3px]' };

export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <span
        className={`inline-block animate-spin rounded-full border-[var(--ht-border)] border-t-[var(--ht-brand)] ${sizeMap[size]}`}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
      {label && label !== 'Loading' ? (
        <span className="text-sm text-[var(--ht-text-muted)]">{label}</span>
      ) : null}
    </div>
  );
}
