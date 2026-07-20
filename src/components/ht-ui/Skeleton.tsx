export type SkeletonProps = {
  className?: string;
  /** shape hint for consumers */
  shape?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ className = '', shape = 'rect', width, height }: SkeletonProps) {
  const radius = shape === 'circle' ? 'rounded-full' : shape === 'text' ? 'rounded' : 'rounded-md';
  return (
    <div
      className={`animate-pulse bg-[var(--ht-surface-2)] ${radius} ${className}`}
      style={{ width, height }}
      aria-hidden
    />
  );
}
