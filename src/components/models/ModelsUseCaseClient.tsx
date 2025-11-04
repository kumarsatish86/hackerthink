'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBrain, FaDownload, FaStar, FaSearch, FaFilter, FaSort,
  FaTimes, FaTh, FaList, FaEye, FaRocket, FaCheckCircle,
  FaCode, FaComments, FaImage, FaMusic, FaFileCode, FaLanguage,
  FaArrowRight, FaChartLine
} from 'react-icons/fa';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  description?: string;
  model_type?: string;
  parameters?: string;
  context_length?: number;
  architecture?: string;
  license?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  logo_url?: string;
  use_cases?: string[];
  capabilities?: string[];
}

interface ModelsUseCaseClientProps {
  useCase: string;
}

// Map use case slugs to search terms and model types
const useCaseMapping: Record<string, {
  name: string;
  icon: typeof FaRocket;
  description: string;
  searchTerms: string[];
  modelTypes?: string[];
}> = {
  'chatbots': {
    name: 'Chatbots',
    icon: FaComments,
    description: 'AI models optimized for conversational AI and chatbot applications',
    searchTerms: ['chat', 'conversation', 'dialogue', 'chatbot', 'conversational'],
    modelTypes: ['text-generation', 'text2text-generation']
  },
  'code-generation': {
    name: 'Code Generation',
    icon: FaCode,
    description: 'AI models specialized for code generation, completion, and programming assistance',
    searchTerms: ['code', 'programming', 'generation', 'completion'],
    modelTypes: ['code-generation', 'text-generation']
  },
  'text-generation': {
    name: 'Text Generation',
    icon: FaFileCode,
    description: 'AI models for generating human-like text content',
    searchTerms: ['text', 'generation', 'writing', 'content'],
    modelTypes: ['text-generation', 'causal-lm']
  },
  'image-generation': {
    name: 'Image Generation',
    icon: FaImage,
    description: 'AI models for creating and generating images from text prompts',
    searchTerms: ['image', 'generation', 'art', 'picture', 'visual'],
    modelTypes: ['image-generation', 'text-to-image']
  },
  'translation': {
    name: 'Translation',
    icon: FaLanguage,
    description: 'AI models for translating text between different languages',
    searchTerms: ['translation', 'translate', 'multilingual', 'language'],
    modelTypes: ['translation', 'text2text-generation']
  },
  'summarization': {
    name: 'Summarization',
    icon: FaFileCode,
    description: 'AI models for summarizing long documents and text',
    searchTerms: ['summarization', 'summary', 'summarize'],
    modelTypes: ['summarization', 'text2text-generation']
  },
  'question-answering': {
    name: 'Question Answering',
    icon: FaComments,
    description: 'AI models for answering questions based on context',
    searchTerms: ['question', 'answering', 'qa', 'answers'],
    modelTypes: ['question-answering', 'text2text-generation']
  },
  'classification': {
    name: 'Classification',
    icon: FaCode,
    description: 'AI models for classifying and categorizing content',
    searchTerms: ['classification', 'classify', 'categorization'],
    modelTypes: ['text-classification', 'image-classification']
  }
};

export default function ModelsUseCaseClient({ useCase }: ModelsUseCaseClientProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [useCaseInfo, setUseCaseInfo] = useState<{
    name: string;
    description: string;
    icon: typeof FaRocket;
    count: number;
  } | null>(null);

  const useCaseData = useCaseMapping[useCase.toLowerCase()] || {
    name: useCase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: FaRocket,
    description: `AI models optimized for ${useCase.replace(/-/g, ' ')} use cases`,
    searchTerms: [useCase],
    modelTypes: []
  };

  const formatRating = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : 'N/A';
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  useEffect(() => {
    fetchModels();
  }, [useCase, selectedLicense, selectedOrg, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModels();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '100');
      
      // Filter by model types if available
      if (useCaseData.modelTypes && useCaseData.modelTypes.length > 0) {
        params.append('model_type', useCaseData.modelTypes.join(','));
      }
      
      // Add search with use case terms
      if (search) {
        params.append('search', search);
      } else if (useCaseData.searchTerms.length > 0) {
        // Default search with use case terms
        params.append('search', useCaseData.searchTerms[0]);
      }
      
      if (selectedLicense) params.append('license', selectedLicense);
      if (selectedOrg) params.append('organization', selectedOrg);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();
      
      // Filter by use_cases or capabilities if available
      let filteredModels = data.models || [];
      
      // Additional filtering by use_cases or capabilities
      if (useCaseData.searchTerms.length > 0) {
        filteredModels = filteredModels.filter((model: AIModel) => {
          const searchText = `${model.name} ${model.description} ${model.model_type || ''} ${(model.use_cases || []).join(' ')} ${(model.capabilities || []).join(' ')}`.toLowerCase();
          return useCaseData.searchTerms.some(term => searchText.includes(term.toLowerCase()));
        });
      }

      setModels(filteredModels);
      if (data.filterOptions) {
        setAvailableLicenses(data.filterOptions.licenses || []);
      }
      
      setUseCaseInfo({
        name: useCaseData.name,
        description: useCaseData.description,
        icon: useCaseData.icon,
        count: filteredModels.length
      });
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedLicense('');
    setSelectedOrg('');
    setSortBy('rating');
    setSortOrder('desc');
  };

  const hasActiveFilters = search || selectedLicense || selectedOrg;
  const Icon = useCaseData.icon;

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Use Case Info */}
      {useCaseInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon className="text-red-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{useCaseInfo.name}</h2>
                <p className="text-gray-600">{useCaseInfo.description}</p>
              </div>
            </div>
            <Link
              href="/models/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaChartLine />
              Compare Models
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">{useCaseInfo.count}</div>
              <div className="text-sm text-gray-600">Models Available</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {models.filter(m => m.license && m.license.toLowerCase().includes('mit') || m.license.toLowerCase().includes('apache')).length}
              </div>
              <div className="text-sm text-gray-600">Open Source</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatNumber(models.reduce((sum, m) => sum + (m.download_count || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${useCaseData.name} models...`}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* License Filter */}
            {availableLicenses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License
                </label>
                <select
                  value={selectedLicense}
                  onChange={(e) => setSelectedLicense(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Licenses</option>
                  {availableLicenses.map((license) => (
                    <option key={license} value={license}>{license}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Organization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                placeholder="Filter by org..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="rating">Rating</option>
                  <option value="downloads">Downloads</option>
                  <option value="created_at">Newest</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <FaSort className={sortOrder === 'asc' ? 'transform rotate-180' : ''} />
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  title="Grid view"
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  title="List view"
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {search && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm flex items-center gap-1">
                  Search: {search}
                  <button onClick={() => setSearch('')}><FaTimes className="text-xs" /></button>
                </span>
              )}
              {selectedLicense && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm flex items-center gap-1">
                  License: {selectedLicense}
                  <button onClick={() => setSelectedLicense('')}><FaTimes className="text-xs" /></button>
                </span>
              )}
              {selectedOrg && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm flex items-center gap-1">
                  Org: {selectedOrg}
                  <button onClick={() => setSelectedOrg('')}><FaTimes className="text-xs" /></button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                <FaFilter /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{models.length}</span> model{models.length !== 1 ? 's' : ''} for {useCaseData.name}
        </p>
      </div>

      {/* Models Grid/List */}
      {models.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Icon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No models found for {useCaseData.name}.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 h-full flex flex-col"
            >
              <div className="flex items-center mb-4">
                {model.logo_url ? (
                  <img
                    src={model.logo_url}
                    alt={model.name}
                    className="w-12 h-12 rounded-lg mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                    <FaBrain className="text-red-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{model.name}</h3>
                  {model.developer && (
                    <p className="text-sm text-gray-500 truncate">{model.developer}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                {model.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div className="flex items-center gap-3">
                  {model.parameters && (
                    <span className="text-xs text-gray-600">{model.parameters}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm font-semibold">{formatRating(model.rating)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FaDownload />
                  <span>{formatNumber(model.download_count || 0)}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <FaCheckCircle className="text-green-600" />
                  <span>Best for {useCaseData.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 flex items-center gap-6"
            >
              {model.logo_url ? (
                <img
                  src={model.logo_url}
                  alt={model.name}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FaBrain className="text-red-600 text-2xl" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{model.name}</h3>
                    {model.developer && (
                      <p className="text-sm text-gray-600">{model.developer}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{formatRating(model.rating)}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {model.description || 'No description available'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {model.parameters && (
                    <span>Parameters: {model.parameters}</span>
                  )}
                  {model.context_length && (
                    <span>Context: {model.context_length.toLocaleString()}</span>
                  )}
                  {model.license && (
                    <span>License: {model.license}</span>
                  )}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-1">
                      <FaDownload />
                      <span>{formatNumber(model.download_count || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <FaCheckCircle />
                      <span>Best for {useCaseData.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Comparison CTA */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-2">Compare {useCaseData.name} Models</h3>
        <p className="text-red-100 mb-4">
          Want to find the best model for your specific needs? Compare these models side-by-side.
        </p>
        <Link
          href="/models/compare"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors"
        >
          <FaChartLine />
          Compare Models Now
        </Link>
      </div>
    </div>
  );
}

