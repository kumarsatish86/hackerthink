// Centralized TypeScript interfaces for learning-roadmap functionality

export interface RoadmapResource {
  title: string;
  link: string;
  type?: string;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  level?: string;
  skills?: string; // comma-separated string
  resources?: RoadmapResource[];
}

export interface RoadmapPrerequisite {
  title: string;
  description: string;
  icon: string;
  type?: string;
  content_id?: string;
  slug?: string;
  link?: string;
}

export interface RoadmapCareerOutcome {
  job_title: string;
  salary_range: string;
  description?: string;
  skills?: string[];
  companies?: string[];
}

export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  slug: string;
  level?: string;
  duration?: string;
  featured_image?: string;
  modules: RoadmapModule[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  prerequisites?: RoadmapPrerequisite[];
  career_outcomes?: RoadmapCareerOutcome[];
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  roadmaps: RoadmapListItem[];
}

export interface RoadmapListItem {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  timeToComplete: string;
  tags: string[];
  slug: string;
  featured_image?: string;
}

// Page Props interfaces
export interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

export interface RoadmapPageClientProps {
  roadmap: RoadmapData;
}

export interface RoadmapListPageClientProps {
  categories: RoadmapCategory[];
  featuredRoadmaps: RoadmapListItem[];
}

export interface RoadmapStructuredDataProps {
  roadmap: RoadmapData;
}

// API Response interfaces
export interface RoadmapApiResponse {
  roadmap: RoadmapData;
  success: boolean;
  message?: string;
}

export interface RoadmapListApiResponse {
  categories: RoadmapCategory[];
  featuredRoadmaps: RoadmapListItem[];
  success: boolean;
  message?: string;
}

// Form interfaces
export interface RoadmapFormData {
  title: string;
  description: string;
  slug: string;
  level?: string;
  duration?: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  modules: Omit<RoadmapModule, 'id'>[];
  prerequisites?: Omit<RoadmapPrerequisite, 'id'>[];
  career_outcomes?: Omit<RoadmapCareerOutcome, 'id'>[];
}

export interface RoadmapUpdateData extends Partial<RoadmapFormData> {
  id: string;
}

// Component prop interfaces
export interface RoadmapCardProps {
  roadmap: RoadmapListItem;
  showLevel?: boolean;
  showDuration?: boolean;
  className?: string;
}

export interface RoadmapModuleProps {
  module: RoadmapModule;
  index: number;
  isActive?: boolean;
  onToggle?: () => void;
}

export interface RoadmapProgressProps {
  totalModules: number;
  completedModules: number;
  className?: string;
}

export interface RoadmapFilterProps {
  levels: string[];
  categories: string[];
  activeLevel?: string;
  activeCategory?: string;
  onLevelChange: (level: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

// Metadata interfaces
export interface RoadmapMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    url: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    type: string;
    siteName: string;
    locale: string;
  };
  twitter: {
    card: string;
    site: string;
    creator: string;
    title: string;
    description: string;
    images: string[];
  };
  alternates: {
    canonical: string;
  };
}

// Search and filter interfaces
export interface RoadmapSearchParams {
  level?: string;
  category?: string;
  search?: string;
  tags?: string[];
}

export interface RoadmapFilters {
  levels: string[];
  categories: string[];
  tags: string[];
}

// Progress tracking interfaces
export interface RoadmapProgress {
  roadmapId: string;
  userId: string;
  completedModules: string[];
  currentModule?: string;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  progressPercentage: number;
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent?: number; // in minutes
  notes?: string;
}
