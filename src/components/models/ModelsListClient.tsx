'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FaBrain, FaDownload, FaStar, FaSearch, FaFilter, FaSort,
  FaTimes, FaTh, FaList, FaEye, FaCode
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
  created_at?: string;
  release_date_full?: string;
}

export default function ModelsListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('model_type') || '');
  const [selectedLicense, setSelectedLicense] = useState(searchParams.get('license') || '');
  const [selectedOrg, setSelectedOrg] = useState(searchParams.get('organization') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);

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
  }, [selectedType, selectedLicense, selectedOrg, sortBy, sortOrder]);

  useEffect(() => {
    // Debounce search
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
      if (search) params.append('search', search);
      if (selectedType) params.append('model_type', selectedType);
      if (selectedLicense) params.append('license', selectedLicense);
      if (selectedOrg) params.append('organization', selectedOrg);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();
      
      setModels(data.models || []);
      if (data.filterOptions) {
        setAvailableTypes(data.filterOptions.modelTypes || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
      }
      
      // Update URL
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (selectedType) newParams.set('model_type', selectedType);
      if (selectedLicense) newParams.set('license', selectedLicense);
      if (selectedOrg) newParams.set('organization', selectedOrg);
      if (sortBy !== 'created_at') newParams.set('sort', sortBy);
      if (sortOrder !== 'desc') newParams.set('order', sortOrder);
      
      router.push(`/models?${newParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedLicense('');
    setSelectedOrg('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = search || selectedType || selectedLicense || selectedOrg;

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              placeholder="Search models by name, developer, or description..."
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
            {/* Model Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Active Filters & View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters && (
                <>
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {search && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm flex items-center gap-1">
                      Search: {search}
                      <button onClick={() => setSearch('')}><FaTimes className="text-xs" /></button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm flex items-center gap-1">
                      Type: {selectedType}
                      <button onClick={() => setSelectedType('')}><FaTimes className="text-xs" /></button>
                    </span>
                  )}
                  {selectedLicense && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center gap-1">
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
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                title="Grid view"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                title="List view"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{models.length}</span> model{models.length !== 1 ? 's' : ''}
        </p>
        <Link
          href="/models/compare"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaChartLine />
          Compare Models
        </Link>
      </div>

      {/* Models Grid/List */}
      {models.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaBrain className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No models found matching your criteria.</p>
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
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {model.model_type || 'General'}
                  </span>
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
                <div className="flex items-center gap-1">
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
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {model.model_type || 'General'}
                  </span>
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
