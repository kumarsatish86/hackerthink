/** HuggingFace-aligned filter taxonomy for dataset discovery */

export const DATASET_MODALITIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'text', label: 'Text', icon: '📝' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'video', label: 'Video', icon: '🎥' },
  { id: 'multimodal', label: 'Multimodal', icon: '🔀' },
  { id: 'tabular', label: 'Tabular', icon: '📊' },
  { id: 'time-series', label: 'Time Series', icon: '📈' },
  { id: 'graph', label: 'Graph', icon: '🕸️' },
  { id: 'code', label: 'Code', icon: '💻' },
];

export const DATASET_FORMATS = [
  'parquet',
  'csv',
  'json',
  'jsonl',
  'arrow',
  'tfrecord',
  'webdataset',
  'hdf5',
  'sqlite',
  'text',
];

export const DATASET_LANGUAGES = [
  'en',
  'zh',
  'multilingual',
  'es',
  'fr',
  'de',
  'ja',
  'ko',
  'ru',
  'ar',
  'hi',
  'pt',
];

export const DATASET_ETHICS = [
  { id: 'commercial', label: 'Commercial-friendly' },
  { id: 'pii', label: 'May contain PII' },
  { id: 'high_risk', label: 'Higher risk' },
];
