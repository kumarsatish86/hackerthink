// Centralized TypeScript interfaces for term/glossary functionality

export interface TermData {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: string;
  difficulty_level?: string;
  learning_path?: string;
  knowledge_test?: string;
  usage_examples?: string;
  official_docs_url?: string;
  video_tutorial_url?: string;
  related_article_url?: string;
  related_terms?: RelatedTerm[];
  created_at: string;
  updated_at: string;
}

export interface RelatedTerm {
  id: string;
  term: string;
  slug: string;
  category: string;
}

export interface TermFilters {
  categories: string[];
  letters: string[];
}

export interface TermPagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface TermSearchParams {
  category?: string;
  letter?: string;
  search?: string;
  page?: number;
}

export interface TermListResponse {
  terms: TermData[];
  pagination: TermPagination;
  filters: TermFilters;
}

export interface TermPageProps {
  params: Promise<{ slug: string }>;
}

export interface TermPageClientProps {
  term: TermData;
  relatedTerms: RelatedTerm[];
}

export interface TermStructuredDataProps {
  term: TermData;
}

// API Response interfaces
export interface TermApiResponse {
  term: TermData;
  relatedTerms: RelatedTerm[];
}

export interface TermListApiResponse {
  terms: TermData[];
  pagination: TermPagination;
  filters: TermFilters;
}

// Form interfaces
export interface TermFormData {
  term: string;
  definition: string;
  category: string;
  difficulty_level?: string;
  learning_path?: string;
  knowledge_test?: string;
  usage_examples?: string;
  official_docs_url?: string;
  video_tutorial_url?: string;
  related_article_url?: string;
}

export interface TermUpdateData extends Partial<TermFormData> {
  id: string;
}

// Component prop interfaces
export interface TermCardProps {
  term: TermData;
  showCategory?: boolean;
  showDifficulty?: boolean;
  className?: string;
}

export interface TermSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export interface TermFilterProps {
  filters: TermFilters;
  activeFilters: TermSearchParams;
  onFilterChange: (filters: Partial<TermSearchParams>) => void;
  onClearFilters: () => void;
}

export interface TermPaginationProps {
  pagination: TermPagination;
  onPageChange: (page: number) => void;
  className?: string;
}

// Metadata interfaces
export interface TermMetadata {
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
