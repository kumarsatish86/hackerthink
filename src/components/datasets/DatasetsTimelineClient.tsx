'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaDownload, FaStar, FaCalendar } from 'react-icons/fa';

interface TimelineDataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  release_date?: string;
  description?: string;
  download_count: number;
  rating: number;
  logo_url?: string;
}

interface GroupedDatasets {
  year: string;
  datasets: TimelineDataset[];
}

export default function DatasetsTimelineClient() {
  const [groupedDatasets, setGroupedDatasets] = useState<GroupedDatasets[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchTimeline();
  }, [selectedYear]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '200');
      params.append('sort', 'release_date');
      params.append('order', 'desc');
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();
      
      const datasets = data.datasets || [];
      
      // Group by year
      const grouped = datasets.reduce((acc: Record<string, TimelineDataset[]>, dataset: TimelineDataset) => {
        if (!dataset.release_date) return acc;
        const year = new Date(dataset.release_date).getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(dataset);
        return acc;
      }, {});

      // Convert to array and sort by year descending
      const groupedArray = Object.entries(grouped)
        .map(([year, datasets]) => ({
          year,
          datasets: datasets.sort((a, b) => {
            const dateA = new Date(a.release_date || '').getTime();
            const dateB = new Date(b.release_date || '').getTime();
            return dateB - dateA;
          })
        }))
        .sort((a, b) => parseInt(b.year) - parseInt(a.year));

      setGroupedDatasets(groupedArray);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const formatRating = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : 'N/A';
  };

  // Get available years
  const availableYears = groupedDatasets.map(g => g.year).sort((a, b) => parseInt(b) - parseInt(a));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Year Filter */}
      {availableYears.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-12">
        {groupedDatasets.map((group) => (
          <div key={group.year} className="relative">
            {/* Year Header */}
            <div className="sticky top-8 z-10 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-4 mb-6">
              <h2 className="text-3xl font-bold">{group.year}</h2>
              <p className="text-red-100">{group.datasets.length} dataset{group.datasets.length !== 1 ? 's' : ''} released</p>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gray-300"></div>

            {/* Datasets */}
            <div className="space-y-6 ml-4">
              {group.datasets.map((dataset, idx) => (
                <div key={dataset.id} className="relative pl-12">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Dataset Card */}
                  <Link
                    href={`/datasets/${dataset.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
                  >
                    <div className="flex items-start gap-4">
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
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600">
                              {dataset.name}
                            </h3>
                            {dataset.provider && (
                              <p className="text-sm text-gray-600">{dataset.provider}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                            <FaCalendar className="text-gray-400" />
                            <span>{formatDate(dataset.release_date)}</span>
                          </div>
                        </div>
                        {dataset.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{dataset.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {dataset.dataset_type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {dataset.dataset_type}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <FaDownload className="text-blue-500" />
                            <span className="text-gray-700">{formatNumber(dataset.download_count || 0)} downloads</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span className="text-gray-700">{formatRating(dataset.rating)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {groupedDatasets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No datasets with release dates found.</p>
        </div>
      )}
    </div>
  );
}

