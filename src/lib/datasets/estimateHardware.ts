import type { DatasetCore } from '@/types/datasets';
import { isCommercialLicense } from './arrayUtils';

export function estimateStorageRam(dataset: DatasetCore): {
  storage: string;
  ram: string;
  estimated: boolean;
} {
  if (dataset.storage_estimate && dataset.ram_estimate) {
    return { storage: dataset.storage_estimate, ram: dataset.ram_estimate, estimated: false };
  }
  const sizeStr = dataset.size || '';
  const sizeMatch = sizeStr.match(/([\d.]+)\s*(kb|mb|gb|tb)/i);
  let gb = 1;
  if (sizeMatch) {
    const n = Number(sizeMatch[1]);
    const u = sizeMatch[2].toLowerCase();
    if (u === 'kb') gb = n / 1_000_000;
    else if (u === 'mb') gb = n / 1000;
    else if (u === 'gb') gb = n;
    else if (u === 'tb') gb = n * 1000;
  } else if (dataset.rows) {
    gb = Math.max(0.1, (dataset.rows * (dataset.columns || 10) * 8) / 1e9);
  }
  const storage = dataset.storage_estimate || `~${gb < 1 ? `${(gb * 1000).toFixed(0)} MB` : `${gb.toFixed(1)} GB`} (est.)`;
  const ram = dataset.ram_estimate || `~${Math.max(1, Math.ceil(gb * 1.5))} GB peak (est.)`;
  return { storage, ram, estimated: true };
}

export function computeFreshnessScore(dataset: DatasetCore): number {
  if (dataset.freshness_score != null) return Number(dataset.freshness_score);
  const ref = dataset.last_updated || dataset.release_date;
  if (!ref) return 40;
  const days = (Date.now() - new Date(ref).getTime()) / 86400000;
  if (days < 90) return 95;
  if (days < 365) return 80;
  if (days < 730) return 60;
  return 40;
}

export function computePopularityScore(dataset: DatasetCore): number {
  if (dataset.popularity_score != null) return Number(dataset.popularity_score);
  const dl = dataset.download_count || 0;
  const views = dataset.view_count || 0;
  return Math.min(100, Math.round(Math.log10(dl + 1) * 18 + Math.log10(views + 1) * 10 + (dataset.rating || 0) * 8));
}

export function commercialFriendly(dataset: DatasetCore): boolean {
  if (dataset.commercial_use != null) return Boolean(dataset.commercial_use);
  return isCommercialLicense(dataset.license);
}
