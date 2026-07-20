/**
 * Small formatting + shape-normalizing helpers shared across the model detail view.
 */

export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export function formatCompactNumber(num?: number | null): string {
  const n = Number(num || 0);
  if (!n) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatRating(value?: number | null): string {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : 'N/A';
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

export function slugToTitle(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isNonEmpty<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}
