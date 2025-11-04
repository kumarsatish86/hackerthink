'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaSearch, FaDownload, FaStar, FaFilter } from 'react-icons/fa';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  domain?: string;
  license?: string;
  size?: string;
  rows?: number;
  rating: number;
  download_count: number;
  logo_url?: string;
}

function DatasetFinderTool() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [datasetType, setDatasetType] = useState('');
  const [domain, setDomain] = useState('');
  const [license, setLicense] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [commercialUse, setCommercialUse] = useState<'all' | 'yes' | 'no'>('all');
  const [minRating, setMinRating] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [datasets, datasetType, domain, license, commercialUse, minRating, searchQuery, minSize, maxSize]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/datasets?status=published&limit=500');
      const data = await response.json();
      
      setDatasets(data.datasets || []);
      
      if (data.filterOptions) {
        setAvailableTypes(data.filterOptions.datasetTypes || []);
        setAvailableDomains(data.filterOptions.domains || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...datasets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.provider?.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
      );
    }

    if (datasetType) {
      filtered = filtered.filter(d => d.dataset_type === datasetType);
    }

    if (domain) {
      filtered = filtered.filter(d => d.domain === domain);
    }

    if (license) {
      filtered = filtered.filter(d => d.license === license);
    }

    if (commercialUse === 'yes') {
      filtered = filtered.filter(d => {
        const lic = d.license?.toLowerCase() || '';
        return lic.includes('mit') || lic.includes('apache') || lic.includes('cc-by') || lic.includes('cc0');
      });
    } else if (commercialUse === 'no') {
      filtered = filtered.filter(d => {
        const lic = d.license?.toLowerCase() || '';
        return lic.includes('non-commercial') || lic.includes('nc');
      });
    }

    if (minRating) {
      filtered = filtered.filter(d => d.rating >= parseFloat(minRating));
    }

    setFilteredDatasets(filtered);
  };

  const clearFilters = () => {
    setDatasetType('');
    setDomain('');
    setLicense('');
    setMinSize('');
    setMaxSize('');
    setCommercialUse('all');
    setMinRating('');
    setSearchQuery('');
  };

  const hasActiveFilters = datasetType || domain || license || commercialUse !== 'all' || minRating || searchQuery;

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaSearch className="text-red-600" />
          Find Your Perfect Dataset
        </h2>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, provider, or description..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dataset Type</label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Domains</option>
                {availableDomains.map((dom) => (
                  <option key={dom} value={dom}>{dom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Licenses</option>
                {availableLicenses.map((lic) => (
                  <option key={lic} value={lic}>{lic}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Use</label>
              <select
                value={commercialUse}
                onChange={(e) => setCommercialUse(e.target.value as 'all' | 'yes' | 'no')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All</option>
                <option value="yes">Yes (Allowed)</option>
                <option value="no">No (Restricted)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              Found <strong>{filteredDatasets.length}</strong> dataset{filteredDatasets.length !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && (
              <span className="text-xs text-gray-500">Filters active</span>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => (
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
                <h3 className="text-lg font-bold text-gray-900 truncate">{dataset.name}</h3>
                <p className="text-sm text-gray-500 truncate">{dataset.provider}</p>
              </div>
            </div>
            <div className="space-y-2">
              {dataset.dataset_type && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {dataset.dataset_type}
                </span>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{dataset.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaDownload className="text-blue-400" />
                  <span>{formatNumber(dataset.download_count || 0)}</span>
                </div>
              </div>
              {dataset.license && (
                <p className="text-xs text-gray-500">{dataset.license}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No datasets match your criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

// Export info sections component
export function DatasetFinderToolInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">How to Use the Dataset Finder</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Use the search bar to find datasets by name, provider, or description</li>
          <li>Filter by dataset type, domain, license, or commercial use requirements</li>
          <li>Set minimum rating to find highly-rated datasets</li>
          <li>Click on any dataset card to view detailed information</li>
          <li>Combine multiple filters to narrow down your search</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Tips for Finding the Right Dataset</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Consider your use case - choose datasets that match your task type</li>
          <li>Check license compatibility with your project requirements</li>
          <li>Review dataset quality ratings and download counts</li>
          <li>Verify data format compatibility with your tools</li>
          <li>Read dataset documentation and ethical considerations</li>
        </ul>
      </section>
    </div>
  );
}

export default DatasetFinderTool;
export { DatasetFinderTool };
