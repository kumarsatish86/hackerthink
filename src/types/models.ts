/**
 * Shared TypeScript contracts for the AI Models module detail payload.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ModelAiSummary {
  what?: string;
  who?: string;
  when_to_use?: string;
  when_not_to_use?: string;
  advantages?: string[];
  limitations?: string[];
  ideal_use_cases?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | string;
}

export interface ModelQuickFacts {
  task?: string;
  architecture?: string;
  model_size?: string;
  input_type?: string;
  output_type?: string;
  framework?: string;
  license?: string;
  inference_speed?: string;
  accuracy?: string;
  memory_usage?: string;
  gpu_requirement?: string;
  cpu_requirement?: string;
  quantized_versions?: string;
  training_dataset?: string;
  commercial_use?: string;
  offline_support?: string;
  embedding_dimension?: string;
  latency?: string;
  python_version?: string;
  cuda_version?: string;
  ram_required?: string;
  install_time?: string;
  install_difficulty?: string;
  verification_command?: string;
  [key: string]: string | undefined;
}

export interface ModelInstallMeta {
  estimated_time?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  python_version?: string;
  cuda_version?: string;
  ram_required?: string;
  gpu_required?: string;
  expected_output?: string;
  verification_command?: string;
  troubleshooting?: string[];
}

export interface ModelProductionReadinessStored {
  score?: number;
  labels?: string[];
  reason?: string;
}

export interface ModelDecisionAssistantStored {
  best_for?: { label: string; rating: string; why?: string }[];
}

export interface ModelPlaygroundConfig {
  demo_url?: string | null;
  embed_url?: string | null;
  api_url?: string | null;
  modality?: string;
  space_id?: string | null;
  [key: string]: JsonValue | undefined;
}

export interface ModelBenchmark {
  id: string;
  benchmark_name: string;
  score?: number | null;
  metric?: string | null;
  dataset?: string | null;
  evaluated_at?: string | null;
  source_url?: string | null;
  notes?: string | null;
}

export interface ModelVersion {
  id: string;
  version: string;
  release_date?: string | null;
  changelog?: string | null;
  breaking_changes?: string | null;
  migration_guide?: string | null;
  deprecated_features?: string | null;
  download_url?: string | null;
  is_latest?: boolean;
}

export interface ModelChangelogEntry {
  id: string;
  version?: string | null;
  title?: string | null;
  body?: string | null;
  change_type?: string | null;
  released_at?: string | null;
}

export interface ModelVariant {
  id: string;
  name: string;
  variant_type?: string | null;
  parameters?: string | null;
  quantization?: string | null;
  notes?: string | null;
  variant_model_id?: string | null;
  slug?: string | null;
}

export interface ModelTrainingDataset {
  id: string;
  dataset_name: string;
  description?: string | null;
  dataset_size?: string | null;
  classes?: string[];
  languages?: string[];
  license?: string | null;
  download_url?: string | null;
  quality_score?: number | null;
  known_biases?: string | null;
  related_dataset_slug?: string | null;
}

export interface ModelUsageExample {
  id: string;
  title: string;
  language: string;
  runtime?: string | null;
  code: string;
  description?: string | null;
}

export interface ModelInstallGuide {
  id: string;
  target: string;
  title?: string | null;
  command?: string | null;
  code?: string | null;
  description?: string | null;
  version_label?: string | null;
}

export interface ModelArchitectureNode {
  id: string;
  node_key: string;
  title: string;
  explanation?: string | null;
  sort_order?: number;
}

export interface ModelFaq {
  id: string;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface ModelTutorial {
  id: string;
  title: string;
  difficulty?: string | null;
  url?: string | null;
  description?: string | null;
  is_video?: boolean;
}

export interface ModelPaper {
  id: string;
  title: string;
  authors?: string | null;
  conference?: string | null;
  published_at?: string | null;
  url?: string | null;
  bibtex?: string | null;
  paper_type?: string | null;
}

export interface ModelUseCaseCard {
  id: string;
  industry: string;
  title?: string | null;
  description?: string | null;
}

export interface ModelApiDoc {
  id: string;
  doc_type: string;
  title?: string | null;
  content?: string | null;
  code?: string | null;
  language?: string | null;
}

export interface ModelSecurityNote {
  id: string;
  note_type: string;
  title?: string | null;
  body?: string | null;
  severity?: string | null;
}

export interface ModelComparisonPeer {
  id: string;
  peer_model_id?: string | null;
  peer_slug?: string | null;
  notes?: string | null;
  name?: string | null;
  developer?: string | null;
  parameters?: string | null;
  license?: string | null;
}

export interface ModelCommunityLink {
  id: string;
  title: string;
  url: string;
  link_type?: string | null;
}

export interface ModelDownloadAnalytics {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  trend: { day: string; downloads: number }[];
  popularity_score: number;
}

export interface ModelRelatedItem {
  type: 'model' | 'dataset' | 'article' | 'tutorial' | 'course' | 'video' | 'paper';
  title: string;
  slug?: string;
  url?: string;
  description?: string;
}

export interface ModelCore {
  id: string;
  name: string;
  slug: string;
  developer?: string | null;
  description?: string | null;
  full_description?: string | null;
  model_type?: string | null;
  architecture?: string | null;
  parameters?: string | null;
  param_count_b?: number | null;
  context_length?: number | null;
  version?: string | null;
  license?: string | null;
  task?: string | null;
  framework?: string | null;
  languages?: string[] | JsonValue;
  categories?: string[] | JsonValue;
  tags?: string[] | JsonValue;
  capabilities?: string[] | JsonValue;
  use_cases?: string[] | JsonValue;
  limitations?: string[] | JsonValue;
  input_types?: string[] | JsonValue;
  output_types?: string[] | JsonValue;
  release_date?: string | null;
  last_updated?: string | null;
  download_count?: number;
  view_count?: number;
  likes_count?: number;
  stars_count?: number;
  rating?: number;
  rating_count?: number;
  trending_rank?: number | null;
  verified?: boolean;
  security_badge?: boolean;
  compatibility_badge?: boolean;
  external_model_id?: string | null;
  logo_url?: string | null;
  featured_image?: string | null;
  demo_url?: string | null;
  download_url?: string | null;
  github_url?: string | null;
  huggingface_url?: string | null;
  paper_url?: string | null;
  documentation_url?: string | null;
  api_endpoint?: string | null;
  homepage_url?: string | null;
  playground_config?: ModelPlaygroundConfig;
  ai_summary?: ModelAiSummary;
  quick_facts?: ModelQuickFacts;
  install_meta?: ModelInstallMeta;
  production_readiness?: ModelProductionReadinessStored;
  decision_assistant?: ModelDecisionAssistantStored;
  compatibility_matrix?: Record<string, boolean | string>;
  overview_guidance?: {
    requirements?: string[];
    dependencies?: string[];
    strengths?: string[];
    weaknesses?: string[];
    common_mistakes?: string[];
    best_practices?: string[];
    expected_performance?: string;
    commercial_usage?: string;
    ethical_considerations?: string;
    known_limitations?: string[];
    features?: string[];
  };
  hardware_requirements?: Record<string, JsonValue>;
  quantized_versions?: JsonValue;
  inference_speed?: string | null;
  memory_footprint?: string | null;
  evaluation_summary?: string | null;
  known_biases?: JsonValue;
  safety_results?: JsonValue;
  ethical_risks?: JsonValue;
  community_stats?: JsonValue;
  github_stats?: JsonValue;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  schema_json?: JsonValue;
  status?: string;
  import_metadata?: JsonValue;
}

export interface ModelDetailPayload {
  model: ModelCore;
  benchmarks: ModelBenchmark[];
  versions: ModelVersion[];
  changelog: ModelChangelogEntry[];
  variants: ModelVariant[];
  training_data: ModelTrainingDataset[];
  usage_examples: ModelUsageExample[];
  install_guides: ModelInstallGuide[];
  architecture_nodes: ModelArchitectureNode[];
  faqs: ModelFaq[];
  tutorials: ModelTutorial[];
  papers: ModelPaper[];
  use_case_cards: ModelUseCaseCard[];
  api_docs: ModelApiDoc[];
  security_notes: ModelSecurityNote[];
  comparisons: ModelComparisonPeer[];
  community_links: ModelCommunityLink[];
  download_analytics: ModelDownloadAnalytics;
  related: ModelRelatedItem[];
}

export const MODEL_DETAIL_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'playground', label: 'Playground' },
  { id: 'examples', label: 'Examples' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'faq', label: 'FAQ' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'community', label: 'Community' },
  { id: 'related', label: 'Related Models' },
] as const;

export type ModelDetailSectionId = (typeof MODEL_DETAIL_SECTIONS)[number]['id'];
