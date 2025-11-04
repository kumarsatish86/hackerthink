'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaDatabase, FaDownload, FaStar, FaSearch, FaFilter, FaSort,
  FaTimes, FaTh, FaList, FaEye
} from 'react-icons/fa';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  description?: string;
  dataset_type?: string;
  format?: string;
  size?: string;
  rows?: number;
  rating: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  logo_url?: string;
  domain?: string;
  license?: string;
  release_date?: string;
  languages?: string[];
}

interface DatasetsCategoryClientProps {
  category: string;
}

export default function DatasetsCategoryClient({ category }: DatasetsCategoryClientProps) {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{
    name: string;
    description?: string;
    count: number;
  } | null>(null);

  // Map category slugs to dataset types
  const categoryMapping: Record<string, string[]> = {
    'text': ['Text', 'text', 'Natural Language'],
    'image': ['Image', 'image', 'Computer Vision'],
    'audio': ['Audio', 'audio', 'Speech', 'speech'],
    'video': ['Video', 'video'],
    'multimodal': ['Multimodal', 'multimodal', 'Multi-modal'],
    'tabular': ['Tabular', 'tabular', 'Table'],
    'time-series': ['Time Series', 'time-series', 'TimeSeries'],
    'graph': ['Graph', 'graph', 'Network'],
    'code': ['Code', 'code', 'Programming'],
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
    fetchDatasets();
  }, [category, selectedLicense, selectedDomain, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDatasets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      // Get dataset types for this category
      const categoryTypes = categoryMapping[category.toLowerCase()] || [category];
      
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '100');
      
      // Filter by dataset types in this category - use the first matching type
      const typeFilter = categoryTypes[0];
      params.append('dataset_type', typeFilter);
      
      if (search) params.append('search', search);
      if (selectedLicense) params.append('license', selectedLicense);
      if (selectedDomain) params.append('domain', selectedDomain);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();
      
      setDatasets(data.datasets || []);
      if (data.filterOptions) {
        setAvailableLicenses(data.filterOptions.licenses || []);
        setAvailableDomains(data.filterOptions.domains || []);
      }
      
      setCategoryInfo({
        name: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: data.total || data.datasets?.length || 0
      });
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedLicense('');
    setSelectedDomain('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = search || selectedLicense || selectedDomain;

  if (loading && datasets.length === 0) {
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
          <h2 className="text-2xl font-bold mb-2">{categoryInfo.name} Datasets</h2>
          <p className="text-gray-600 mb-4">
            Discover {categoryInfo.count} {categoryInfo.name.toLowerCase()} dataset{categoryInfo.count !== 1 ? 's' : ''} for your machine learning projects.
          </p>
          {categoryInfo.description && (
            <p className="text-gray-700">{categoryInfo.description}</p>
          )}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${categoryName.toLowerCase()} datasets...`}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Domains</option>
            {availableDomains.map((domain) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          {/* License Filter */}
          <select
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Licenses</option>
            {availableLicenses.map((license) => (
              <option key={license} value={license}>{license}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="download_count-desc">Most Downloaded</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <FaList />
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Datasets Grid/List */}
      {datasets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">
            {hasActiveFilters 
              ? 'No datasets match your filters. Try adjusting your search criteria.'
              : `No ${categoryName.toLowerCase()} datasets available yet.`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/datasets/${dataset.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center mb-4">
                {dataset.logo_url ? (
                  <img
                    src={dataset.logo_url}
                    alt={dataset.name}
                    className="w-12 h-12 rounded-lg mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                    <FaDatabase className="text-red-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{dataset.name}</h3>
                  {dataset.provider && (
                    <p className="text-sm text-gray-500 truncate">{dataset.provider}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {dataset.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">{dataset.dataset_type || 'General'}</p>
                  {dataset.size && (
                    <p className="text-xs text-gray-400">{dataset.size}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FaDownload className="text-blue-400" />
                  <span className="text-sm">{formatNumber(dataset.download_count || 0)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm font-semibold">{formatRating(dataset.rating)}</span>
                  <span className="text-xs text-gray-500">({dataset.rating_count || 0})</span>
                </div>
                {dataset.languages && dataset.languages.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {dataset.languages.slice(0, 2).join(', ')}
                    {dataset.languages.length > 2 && ` +${dataset.languages.length - 2}`}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/datasets/${dataset.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex items-start gap-4"
            >
              {dataset.logo_url ? (
                <img
                  src={dataset.logo_url}
                  alt={dataset.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FaDatabase className="text-red-600 w-8 h-8" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{dataset.name}</h3>
                    {dataset.provider && (
                      <p className="text-sm text-gray-500">{dataset.provider}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <FaStar className="text-yellow-400" />
                    <span className="text-sm font-semibold">{formatRating(dataset.rating)}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {dataset.description || 'No description available'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {dataset.dataset_type && (
                    <span className="bg-gray-100 px-2 py-1 rounded">{dataset.dataset_type}</span>
                  )}
                  {dataset.domain && (
                    <span className="bg-blue-100 px-2 py-1 rounded">{dataset.domain}</span>
                  )}
                  {dataset.license && (
                    <span className="bg-green-100 px-2 py-1 rounded">{dataset.license}</span>
                  )}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-1">
                      <FaDownload className="text-blue-400" />
                      <span>{formatNumber(dataset.download_count || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEye className="text-green-400" />
                      <span>{formatNumber(dataset.view_count || 0)}</span>
                    </div>
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

