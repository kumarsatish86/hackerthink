'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FaBrain, FaDownload, FaStar, FaCalendar, FaFilter,
  FaChevronDown, FaChevronUp, FaBuilding, FaChartLine
} from 'react-icons/fa';

interface TimelineModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  model_type?: string;
  parameters?: string;
  architecture?: string;
  license?: string;
  rating: number;
  download_count: number;
  logo_url?: string;
  release_date_full?: string;
  release_date?: string;
  created_at?: string;
}

interface ModelsTimelineClientProps {}

export default function ModelsTimelineClient({}: ModelsTimelineClientProps) {
  const [models, setModels] = useState<TimelineModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2024', '2023', '2022']));
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchModels();
  }, [selectedYear, selectedOrg, selectedType]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '500'); // Get more models for timeline
      if (selectedYear) {
        // Filter by year based on release_date_full or created_at
        // This would ideally be done in the API, but for now we'll filter client-side
      }
      if (selectedOrg) params.append('organization', selectedOrg);
      if (selectedType) params.append('model_type', selectedType);
      params.append('sort', 'release_date_full');
      params.append('order', 'desc');

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();
      
      const modelsData = (data.models || []).filter((model: TimelineModel) => {
        if (!selectedYear) return true;
        const date = model.release_date_full || model.release_date || model.created_at;
        if (!date) return false;
        const year = new Date(date).getFullYear().toString();
        return year === selectedYear;
      });

      setModels(modelsData);

      // Extract unique years, orgs, and types
      const years = new Set<string>();
      const orgs = new Set<string>();
      const types = new Set<string>();

      modelsData.forEach((model: TimelineModel) => {
        const date = model.release_date_full || model.release_date || model.created_at;
        if (date) {
          const year = new Date(date).getFullYear().toString();
          years.add(year);
        }
        if (model.developer) orgs.add(model.developer);
        if (model.model_type) types.add(model.model_type);
      });

      setAvailableYears(Array.from(years).sort((a, b) => b.localeCompare(a)));
      setAvailableOrgs(Array.from(orgs).sort());
      setAvailableTypes(Array.from(types).sort());
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group models by year
  const modelsByYear = useMemo(() => {
    const grouped: Record<string, TimelineModel[]> = {};
    
    models.forEach(model => {
      const date = model.release_date_full || model.release_date || model.created_at;
      if (!date) return;
      
      const year = new Date(date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(model);
    });

    // Sort models within each year by date (newest first)
    Object.keys(grouped).forEach(year => {
      grouped[year].sort((a, b) => {
        const dateA = new Date(a.release_date_full || a.release_date || a.created_at || 0).getTime();
        const dateB = new Date(b.release_date_full || b.release_date || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    });

    return grouped;
  }, [models]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const sortedYears = Object.keys(modelsByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaFilter className="text-red-600" />
          Filter Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Organizations</option>
              {availableOrgs.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
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
        </div>
        {(selectedYear || selectedOrg || selectedType) && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setSelectedYear('');
                setSelectedOrg('');
                setSelectedType('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedYears.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaCalendar className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No models found matching the selected criteria.</p>
          </div>
        ) : (
          sortedYears.map((year) => {
            const yearModels = modelsByYear[year];
            const isExpanded = expandedYears.has(year);
            
            return (
              <div key={year} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Year Header */}
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between hover:from-red-700 hover:to-red-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-2xl" />
                    <h2 className="text-2xl font-bold">{year}</h2>
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {yearModels.length} model{yearModels.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {/* Year Models */}
                {isExpanded && (
                  <div className="p-6">
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200"></div>
                      
                      <div className="space-y-6">
                        {yearModels.map((model, index) => {
                          const date = model.release_date_full || model.release_date || model.created_at;
                          return (
                            <div key={model.id} className="relative pl-20">
                              {/* Timeline Dot */}
                              <div className="absolute left-4 w-8 h-8 rounded-full bg-red-600 border-4 border-white shadow-lg flex items-center justify-center">
                                <FaBrain className="text-white text-xs" />
                              </div>
                              
                              {/* Model Card */}
                              <Link
                                href={`/models/${model.slug}`}
                                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border-l-4 border-red-500"
                              >
                                <div className="flex items-start gap-4">
                                  {model.logo_url ? (
                                    <img
                                      src={model.logo_url}
                                      alt={model.name}
                                      className="w-12 h-12 rounded-lg flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                      <FaBrain className="text-red-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                          {model.name}
                                        </h3>
                                        {model.developer && (
                                          <p className="text-sm text-gray-600">
                                            {model.developer}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                        <FaStar className="text-yellow-400" />
                                        <span className="font-semibold">{formatRating(model.rating)}</span>
                                      </div>
                                    </div>
                                    
                                    {date && (
                                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <FaCalendar />
                                        Released: {formatDate(date)}
                                      </p>
                                    )}
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                      {model.model_type && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                          {model.model_type}
                                        </span>
                                      )}
                                      {model.parameters && (
                                        <span className="font-medium">{model.parameters}</span>
                                      )}
                                      {model.architecture && (
                                        <span className="text-gray-500">{model.architecture}</span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <FaDownload />
                                        <span>{formatNumber(model.download_count || 0)} downloads</span>
                                      </div>
                                      <span className="text-red-600 hover:text-red-800 font-medium">
                                        View Details →
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-red-600" />
          Timeline Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{sortedYears.length}</div>
            <div className="text-sm text-gray-600">Years Covered</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{models.length}</div>
            <div className="text-sm text-gray-600">Total Models</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{availableOrgs.length}</div>
            <div className="text-sm text-gray-600">Organizations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

