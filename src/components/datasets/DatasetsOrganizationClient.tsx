'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaDownload, FaStar, FaSearch, FaTh, FaList } from 'react-icons/fa';

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
}

interface DatasetsOrganizationClientProps {
  organization: string;
}

export default function DatasetsOrganizationClient({ organization }: DatasetsOrganizationClientProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDatasets();
  }, [sortBy]);

  useEffect(() => {
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
      params.append('sort', sortBy);
      params.append('order', 'desc');
      if (search) params.append('search', search);

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();
      
      // Filter by organization/provider
      const filtered = (data.datasets || []).filter((d: Dataset) => 
        d.provider?.toLowerCase().includes(organization.toLowerCase()) ||
        organization.toLowerCase().includes(d.provider?.toLowerCase() || '')
      );
      
      setDatasets(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{organization} Datasets</h2>
          <p className="text-gray-600">Showing {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} from {organization}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="created_at">Newest First</option>
            <option value="download_count">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* View Mode */}
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
        </div>
      </div>

      {/* Datasets Grid/List */}
      {datasets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">
            {search 
              ? 'No datasets match your search.'
              : `No datasets found from ${organization}.`}
          </p>
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
                  <p className="text-sm text-gray-500 truncate">{dataset.provider}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {dataset.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm font-semibold">{formatRating(dataset.rating)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaDownload className="text-blue-400" />
                  <span className="text-sm">{formatNumber(dataset.download_count || 0)}</span>
                </div>
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
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{dataset.name}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{dataset.description || 'No description available'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{formatRating(dataset.rating)} ({dataset.rating_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaDownload className="text-blue-400" />
                    <span>{formatNumber(dataset.download_count || 0)} downloads</span>
                  </div>
                  {dataset.dataset_type && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{dataset.dataset_type}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

