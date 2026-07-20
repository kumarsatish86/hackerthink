/** Shared JSON-configurable action used across ht-ui compounds. */
export type HtAction = {
  id: string;
  label: string;
  href?: string;
  onClickId?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  external?: boolean;
};

export type HtTone = 'neutral' | 'brand' | 'success' | 'warning' | 'info' | 'danger';

export type HtDensity = 'compact' | 'default' | 'comfortable';
