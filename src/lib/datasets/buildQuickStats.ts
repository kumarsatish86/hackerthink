import type { DatasetCore } from '@/types/datasets';
import { formatCompactNumber, formatDate, toStringArray } from './arrayUtils';
import { commercialFriendly, estimateStorageRam } from './estimateHardware';

export type QuickStatItem = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  estimated?: boolean;
};

export function buildQuickStats(dataset: DatasetCore): QuickStatItem[] {
  const splits = (dataset.split_info || {}) as Record<string, { num_examples?: number } | number>;
  const langs = toStringArray(dataset.languages);
  const tasks = toStringArray(dataset.task_types);
  const hw = estimateStorageRam(dataset);
  const qf = dataset.quick_facts || {};

  const train =
    typeof splits.train === 'number'
      ? splits.train
      : (splits.train as { num_examples?: number })?.num_examples;
  const val =
    typeof splits.validation === 'number'
      ? splits.validation
      : (splits.validation as { num_examples?: number })?.num_examples ||
        (splits.val as { num_examples?: number })?.num_examples;
  const test =
    typeof splits.test === 'number'
      ? splits.test
      : (splits.test as { num_examples?: number })?.num_examples;

  const items: (QuickStatItem | null)[] = [
    { id: 'samples', label: 'Total Samples', value: formatCompactNumber(dataset.rows) },
    train != null ? { id: 'train', label: 'Training Samples', value: formatCompactNumber(Number(train)) } : null,
    val != null ? { id: 'val', label: 'Validation Samples', value: formatCompactNumber(Number(val)) } : null,
    test != null ? { id: 'test', label: 'Test Samples', value: formatCompactNumber(Number(test)) } : null,
    langs.length ? { id: 'langs', label: 'Languages', value: String(langs.length) } : dataset.language ? { id: 'langs', label: 'Languages', value: '1' } : null,
    qf.classes || dataset.columns
      ? { id: 'classes', label: 'Classes / Columns', value: String(qf.classes || dataset.columns) }
      : null,
    dataset.size ? { id: 'size', label: 'File Size', value: String(dataset.size) } : null,
    { id: 'storage', label: 'Storage Required', value: hw.storage, estimated: hw.estimated },
    { id: 'ram', label: 'RAM Required', value: hw.ram, estimated: hw.estimated },
    dataset.license ? { id: 'license', label: 'License', value: dataset.license } : null,
    {
      id: 'commercial',
      label: 'Commercial Friendly',
      value: commercialFriendly(dataset) ? 'Yes' : 'Review license',
    },
    dataset.format ? { id: 'format', label: 'Data Format', value: dataset.format } : null,
    dataset.modality ? { id: 'modality', label: 'Modality', value: dataset.modality } : null,
    tasks[0] ? { id: 'task', label: 'Primary Task', value: tasks[0] } : null,
    dataset.dataset_type ? { id: 'type', label: 'Dataset Type', value: dataset.dataset_type } : null,
    { id: 'downloads', label: 'Downloads', value: formatCompactNumber(dataset.download_count) },
    dataset.release_date
      ? { id: 'released', label: 'Release Date', value: formatDate(dataset.release_date) || dataset.release_date }
      : null,
  ];

  return items.filter((x): x is QuickStatItem => Boolean(x && x.value && x.value !== '—'));
}
