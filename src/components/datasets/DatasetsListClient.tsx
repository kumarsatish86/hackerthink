'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaDatabase, FaDownload, FaStar, FaSearch, FaFilter, FaTimes, FaTh, FaList, FaSort } from 'react-icons/fa';

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
  language?: string;
  languages?: string[];
}

export default function DatasetsListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('dataset_type') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || '');
  const [selectedLicense, setSelectedLicense] = useState(searchParams.get('license') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

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
  }, [selectedType, selectedDomain, selectedLicense, selectedYear, sortBy, sortOrder]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchDatasets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '100');
      if (search) params.append('search', search);
      if (selectedType) params.append('dataset_type', selectedType);
      if (selectedDomain) params.append('domain', selectedDomain);
      if (selectedLicense) params.append('license', selectedLicense);
      if (selectedYear) params.append('year', selectedYear);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();
      
      setDatasets(data.datasets || []);
      setTotal(data.total || 0);
      if (data.filterOptions) {
        setAvailableTypes(data.filterOptions.datasetTypes || []);
        setAvailableDomains(data.filterOptions.domains || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
        setAvailableYears(data.filterOptions.years || []);
      }
      
      // Update URL
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (selectedType) newParams.set('dataset_type', selectedType);
      if (selectedDomain) newParams.set('domain', selectedDomain);
      if (selectedLicense) newParams.set('license', selectedLicense);
      if (selectedYear) newParams.set('year', selectedYear);
      if (sortBy !== 'created_at') newParams.set('sort', sortBy);
      if (sortOrder !== 'desc') newParams.set('order', sortOrder);
      
      router.push(`/datasets?${newParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedDomain('');
    setSelectedLicense('');
    setSelectedYear('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = search || selectedType || selectedDomain || selectedLicense || selectedYear;

  if (loading && datasets.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              placeholder="Search datasets by name, provider, or description..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaFilter />
            Filters
            {hasActiveFilters && (
              <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                {[selectedType, selectedDomain, selectedLicense, selectedYear].filter(Boolean).length}
              </span>
            )}
          </button>

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
            <option value="download_count-asc">Least Downloaded</option>
            <option value="view_count-desc">Most Viewed</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="release_date-desc">Latest Release</option>
            <option value="release_date-asc">Oldest Release</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Dataset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dataset Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Domains</option>
                {availableDomains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
              <select
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Licenses</option>
                {availableLicenses.map((license) => (
                  <option key={license} value={license}>{license}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Release Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <FaTimes /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && !showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                Type: {selectedType}
                <button onClick={() => setSelectedType('')} className="ml-2 text-red-600 hover:text-red-800">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {selectedDomain && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Domain: {selectedDomain}
                <button onClick={() => setSelectedDomain('')} className="ml-2 text-blue-600 hover:text-blue-800">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {selectedLicense && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                License: {selectedLicense}
                <button onClick={() => setSelectedLicense('')} className="ml-2 text-green-600 hover:text-green-800">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {selectedYear && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Year: {selectedYear}
                <button onClick={() => setSelectedYear('')} className="ml-2 text-purple-600 hover:text-purple-800">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Search: {search}
                <button onClick={() => setSearch('')} className="ml-2 text-gray-600 hover:text-gray-800">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {datasets.length} of {total} datasets
        </div>
      </div>

      {/* Datasets Grid/List */}
      {datasets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">
            {hasActiveFilters 
              ? 'No datasets match your filters. Try adjusting your search criteria.'
              : 'No datasets available yet. Check back soon!'}
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
                      <FaStar className="text-yellow-400" />
                      <span>{dataset.rating_count || 0} ratings</span>
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
