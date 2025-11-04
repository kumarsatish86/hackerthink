'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaBrain, FaDownload, FaStar, FaSearch, FaFilter, FaSort,
  FaTimes, FaTh, FaList, FaEye, FaArrowRight
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
}

interface ModelsCategoryClientProps {
  category: string;
}

export default function ModelsCategoryClient({ category }: ModelsCategoryClientProps) {
  const router = useRouter();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{
    name: string;
    description?: string;
    count: number;
  } | null>(null);

  // Map category slugs to model types
  const categoryMapping: Record<string, string[]> = {
    'text-generation': ['text-generation', 'text2text-generation', 'causal-lm', 'text'],
    'vision': ['image-classification', 'image-generation', 'image-to-text', 'object-detection', 'image-segmentation'],
    'multimodal': ['image-to-text', 'text-to-image', 'visual-question-answering', 'multimodal'],
    'audio': ['audio-classification', 'text-to-speech', 'automatic-speech-recognition', 'audio'],
    'nlp': ['text-classification', 'token-classification', 'question-answering', 'summarization', 'translation'],
    'code': ['code-generation', 'code', 'fill-mask'],
    'embeddings': ['feature-extraction', 'sentence-similarity', 'embeddings'],
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
  }, [category, selectedLicense, selectedOrg, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModels();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      // Get model types for this category
      const categoryTypes = categoryMapping[category.toLowerCase()] || [category];
      
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '100');
      
      // Filter by model types in this category
      const typeFilter = categoryTypes.join(',');
      params.append('model_type', typeFilter);
      
      if (search) params.append('search', search);
      if (selectedLicense) params.append('license', selectedLicense);
      if (selectedOrg) params.append('organization', selectedOrg);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();
      
      setModels(data.models || []);
      if (data.filterOptions) {
        setAvailableLicenses(data.filterOptions.licenses || []);
      }
      
      setCategoryInfo({
        name: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: data.total || data.models?.length || 0
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
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = search || selectedLicense || selectedOrg;

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Category Info */}
      {categoryInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{categoryInfo.name} Models</h2>
              <p className="text-gray-600">
                Found <span className="font-semibold">{categoryInfo.count}</span> model{categoryInfo.count !== 1 ? 's' : ''} in this category
              </p>
            </div>
            <Link
              href="/models/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Compare Models
              <FaArrowRight />
            </Link>
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
              placeholder={`Search ${categoryName} models...`}
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
                  <option value="created_at">Newest</option>
                  <option value="rating">Rating</option>
                  <option value="downloads">Downloads</option>
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
          Showing <span className="font-semibold">{models.length}</span> model{models.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Models Grid/List */}
      {models.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaBrain className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No {categoryName.toLowerCase()} models found matching your criteria.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 underline"
            >
              Clear filters to see all models
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
                  <FaEye />
                  <span>View details →</span>
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
                  <div className="flex items-center gap-1 ml-auto">
                    <FaDownload />
                    <span>{formatNumber(model.download_count || 0)} downloads</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

