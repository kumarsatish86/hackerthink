export function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function parseJsonField<T = unknown>(field: unknown, fallback: T): T {
  if (field == null) return fallback;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return fallback;
    }
  }
  return field as T;
}

export function formatCompactNumber(n?: number | null): string {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

export function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isCommercialLicense(license?: string | null): boolean {
  if (!license) return false;
  if (/nc|non.?commercial|gpl/i.test(license)) return false;
  return /mit|apache|bsd|cc-by|openrail|cdla|public.?domain/i.test(license);
}
