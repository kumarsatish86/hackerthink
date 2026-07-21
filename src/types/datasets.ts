/**
 * Dataset Intelligence Platform — shared TypeScript contracts.
 * Additive expansion only.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface DatasetAiSummary {
  what?: string;
  who?: string;
  when_to_use?: string;
  when_not_to_use?: string;
  advantages?: string[];
  limitations?: string[];
  ideal_use_cases?: string[];
  difficulty?: string;
  recommended_models?: string[];
  recommended_tasks?: string[];
  commercial_suitability?: string;
  beginner_summary?: string;
  expert_summary?: string;
}

export interface DatasetQuickFacts {
  [key: string]: string | number | boolean | undefined;
}

export interface DatasetCore {
  id: string;
  name: string;
  slug: string;
  provider?: string | null;
  description?: string | null;
  full_description?: string | null;
  dataset_type?: string | null;
  format?: string | null;
  size?: string | null;
  rows?: number | null;
  columns?: number | null;
  features?: JsonValue;
  split_info?: Record<string, JsonValue> | JsonValue;
  sample_data?: JsonValue;
  schema_json?: JsonValue;
  language?: string | null;
  languages?: string[] | JsonValue;
  domain?: string | null;
  task_types?: string[] | JsonValue;
  categories?: string[] | JsonValue;
  tags?: string[] | JsonValue;
  license?: string | null;
  citation?: string | null;
  quality_score?: number | null;
  collection_method?: string | null;
  ethical_considerations?: string | null;
  preprocessing_info?: string | null;
  paper_url?: string | null;
  documentation_url?: string | null;
  download_url?: string | null;
  huggingface_url?: string | null;
  kaggle_url?: string | null;
  github_url?: string | null;
  release_date?: string | null;
  last_updated?: string | null;
  version?: string | null;
  logo_url?: string | null;
  featured_image?: string | null;
  status?: string | null;
  featured?: boolean;
  rating?: number;
  rating_count?: number;
  view_count?: number;
  download_count?: number;
  stars_count?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  ai_summary?: DatasetAiSummary;
  quick_facts?: DatasetQuickFacts;
  modality?: string | null;
  commercial_use?: boolean | null;
  freshness_score?: number | null;
  popularity_score?: number | null;
  storage_estimate?: string | null;
  ram_estimate?: string | null;
  external_dataset_id?: string | null;
  verified?: boolean;
  security_badge?: boolean;
  overview_guidance?: {
    purpose?: string;
    history?: string;
    advantages?: string[];
    limitations?: string[];
    strengths?: string[];
    weaknesses?: string[];
    common_mistakes?: string[];
    best_practices?: string[];
    known_issues?: string[];
    commercial_usage?: string;
    privacy_considerations?: string;
    input_format?: string;
    output_format?: string;
  };
  ideal_hardware?: JsonValue;
  risk_score?: number | null;
  comparison_notes?: string | null;
  tutorial_links?: JsonValue;
  related_models?: JsonValue;
  preprocessing_tools?: JsonValue;
  annotation_guide?: JsonValue;
  download_size_breakdown?: JsonValue;
  import_source?: string | null;
  import_metadata?: JsonValue;
  enrichment_applied?: boolean;
}

export interface DatasetBenchmark {
  id: string;
  benchmark_name: string;
  score?: number | null;
  metric?: string | null;
  source?: string | null;
  notes?: string | null;
}

export interface DatasetVersion {
  id: string;
  version: string;
  release_date?: string | null;
  changelog?: string | null;
  is_latest?: boolean;
}

export interface DatasetChangelogEntry {
  id: string;
  version?: string | null;
  title?: string | null;
  body?: string | null;
  changed_at?: string | null;
}

export interface DatasetSplit {
  id: string;
  split_name: string;
  sample_count?: number | null;
  notes?: string | null;
}

export interface DatasetFileNode {
  id: string;
  path: string;
  node_type: 'file' | 'folder';
  format?: string | null;
  size_bytes?: number | null;
  schema_hint?: string | null;
}

export interface DatasetSample {
  id: string;
  modality?: string | null;
  label?: string | null;
  text_content?: string | null;
  media_url?: string | null;
  metadata?: JsonValue;
  annotations?: JsonValue;
  sort_order?: number;
}

export interface DatasetQualityMetric {
  id: string;
  metric_key: string;
  label: string;
  value: number;
  source?: 'official' | 'community' | 'estimated' | string;
  confidence?: string | null;
  notes?: string | null;
}

export interface DatasetStatisticSeries {
  id: string;
  series_key: string;
  label: string;
  points: { name: string; value: number }[];
  source?: string | null;
}

export interface DatasetDownloadMirror {
  id: string;
  label: string;
  url: string;
  provider?: string | null;
  checksum?: string | null;
  size_hint?: string | null;
}

export interface DatasetPreprocessingGuide {
  id: string;
  title: string;
  language: string;
  framework?: string | null;
  code: string;
  tier?: string | null;
}

export interface DatasetAnnotationDoc {
  id: string;
  format_name: string;
  description?: string | null;
  example_json?: JsonValue;
}

export interface DatasetPaper {
  id: string;
  title: string;
  url?: string | null;
  authors?: string | null;
  conference?: string | null;
  published_at?: string | null;
  bibtex?: string | null;
}

export interface DatasetTutorial {
  id: string;
  title: string;
  url?: string | null;
  tier?: string | null;
  description?: string | null;
}

export interface DatasetFaq {
  id: string;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface DatasetCommunityLink {
  id: string;
  title: string;
  url: string;
  link_type?: string | null;
}

export interface DatasetComparisonPeer {
  id: string;
  peer_slug?: string | null;
  name?: string | null;
  notes?: string | null;
  samples?: string | null;
  classes?: string | null;
  license?: string | null;
}

export interface DatasetSecurityNote {
  id: string;
  title: string;
  body: string;
  severity?: string | null;
}

export interface DatasetRelatedItem {
  id: string;
  type: string;
  title: string;
  slug?: string | null;
  url?: string | null;
  description?: string | null;
}

export interface DatasetModelLink {
  id: string;
  name: string;
  slug: string;
  developer?: string | null;
  model_type?: string | null;
  parameters?: string | null;
  logo_url?: string | null;
}

export interface DatasetDetailPayload {
  dataset: DatasetCore;
  benchmarks: DatasetBenchmark[];
  versions: DatasetVersion[];
  changelog: DatasetChangelogEntry[];
  splits: DatasetSplit[];
  files: DatasetFileNode[];
  samples: DatasetSample[];
  quality_metrics: DatasetQualityMetric[];
  statistics: DatasetStatisticSeries[];
  downloads: DatasetDownloadMirror[];
  preprocessing: DatasetPreprocessingGuide[];
  annotations: DatasetAnnotationDoc[];
  papers: DatasetPaper[];
  tutorials: DatasetTutorial[];
  faqs: DatasetFaq[];
  community_links: DatasetCommunityLink[];
  comparisons: DatasetComparisonPeer[];
  security_notes: DatasetSecurityNote[];
  related: DatasetRelatedItem[];
  models_using: DatasetModelLink[];
  similar_datasets: DatasetModelLink[];
}

export const DATASET_DETAIL_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'samples', label: 'Samples' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'quality', label: 'Data Quality' },
  { id: 'download', label: 'Download' },
  { id: 'structure', label: 'Structure' },
  { id: 'preprocessing', label: 'Preprocessing' },
  { id: 'annotations', label: 'Annotations' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'models', label: 'Models' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'papers', label: 'Papers' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'security', label: 'Security & Ethics' },
  { id: 'faq', label: 'FAQ' },
  { id: 'community', label: 'Community' },
  { id: 'related', label: 'Related' },
  { id: 'changelog', label: 'Changelog' },
] as const;
