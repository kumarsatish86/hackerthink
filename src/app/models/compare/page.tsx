'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FaBrain, FaArrowLeft, FaStar, FaChartLine, FaDownload, FaGavel, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCode,
  FaUsers, FaEye, FaCopy, FaTrash
} from 'react-icons/fa';
import { ModelsThemeProvider } from '@/components/models/ModelsThemeProvider';
import ComparisonTable from '@/components/models/ComparisonTable';
import '@/styles/models.css';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  description?: string;
  model_type?: string;
  architecture?: string;
  parameters?: string;
  context_length?: number;
  version?: string;
  license?: string;
  pricing_type?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  logo_url?: string;
  status?: string;
  github_stats?: {
    stars?: number;
    forks?: number;
    issues?: number;
  };
  community_stats?: {
    downloads?: number;
    likes?: number;
  };
  benchmarks?: any;
}

export default function ModelComparisonPage() {
  const searchParams = useSearchParams();
  const [allModels, setAllModels] = useState<AIModel[]>([]);
  const [selectedModelSlugs, setSelectedModelSlugs] = useState<string[]>([]);
  const [comparison, setComparison] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const lastComparedKeyRef = useRef<string>('');
  const comparingRef = useRef(false);

  const selectionKey = (slugs: string[]) => [...slugs].filter(Boolean).sort().join(',');

  const compareModels = async (slugs?: string[]) => {
    const slugsToCompare = slugs || selectedModelSlugs;

    if (slugsToCompare.length < 2) {
      return;
    }

    if (slugsToCompare.length > 5) {
      alert('Maximum 5 models can be compared at once');
      return;
    }

    const key = selectionKey(slugsToCompare);
    // Prevent flicker loop: same selection already loaded / in flight
    if (comparingRef.current || lastComparedKeyRef.current === key) {
      return;
    }

    comparingRef.current = true;
    lastComparedKeyRef.current = key;
    setLoading(true);
    try {
      const slugsParam = slugsToCompare.join(',');
      const response = await fetch(`/api/models/compare?slugs=${slugsParam}`);
      const data = await response.json();

      if (data.error) {
        lastComparedKeyRef.current = '';
        alert(data.error);
      } else {
        setComparison(data.models || []);
        const nextUrl = `/models/compare?models=${slugsParam}`;
        const current = `${window.location.pathname}${window.location.search}`;
        if (current !== nextUrl) {
          window.history.replaceState({}, '', nextUrl);
        }
      }
    } catch (error) {
      console.error('Error comparing models:', error);
      lastComparedKeyRef.current = '';
      alert('Failed to load comparison');
    } finally {
      comparingRef.current = false;
      setLoading(false);
    }
  };

  // Load catalog once (not on every URL change — that caused reload flicker)
  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const response = await fetch('/api/models?status=published&limit=1000');
        if (!response.ok) {
          throw new Error(`Failed to load models: ${response.statusText}`);
        }
        const data = await response.json();
        setAllModels(data.models || []);
      } catch (err) {
        console.error('Error loading models:', err);
        setAllModels([]);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Sync selection from URL and compare once per unique set
  useEffect(() => {
    const slugsParam = searchParams.get('models');
    if (!slugsParam) return;

    const slugs = slugsParam.split(',').filter(Boolean);
    setSelectedModelSlugs(slugs);

    if (slugs.length >= 2 && allModels.length > 0) {
      const key = selectionKey(slugs);
      if (lastComparedKeyRef.current !== key) {
        compareModels(slugs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allModels.length, searchParams]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim() || !allModels.length) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return allModels
      .filter((model) => {
        const name = (model.name || '').toLowerCase();
        const developer = (model.developer || '').toLowerCase();
        const modelType = (model.model_type || '').toLowerCase();
        const slug = (model.slug || '').toLowerCase();
        return (
          name.includes(query) ||
          developer.includes(query) ||
          modelType.includes(query) ||
          slug.includes(query)
        );
      })
      .slice(0, 10);
  }, [searchQuery, allModels]);

  const addModel = (slug: string) => {
    if (!selectedModelSlugs.includes(slug) && selectedModelSlugs.length < 5) {
      const newSelection = [...selectedModelSlugs, slug];
      lastComparedKeyRef.current = '';
      setSelectedModelSlugs(newSelection);
      setSearchQuery('');
      setShowSearchResults(false);

      if (newSelection.length >= 2) {
        compareModels(newSelection);
      }
    } else if (selectedModelSlugs.length >= 5) {
      alert('Maximum 5 models can be compared at once');
    }
  };

  const removeModel = (slug: string) => {
    const newSelection = selectedModelSlugs.filter((s) => s !== slug);
    lastComparedKeyRef.current = '';
    setSelectedModelSlugs(newSelection);

    if (newSelection.length >= 2) {
      compareModels(newSelection);
    } else {
      setComparison([]);
      window.history.replaceState({}, '', '/models/compare');
    }
  };

  const handleCompare = () => {
    lastComparedKeyRef.current = '';
    compareModels();
  };

  const formatRating = (rating: number) => {
    return typeof rating === 'number' && !isNaN(rating) ? rating.toFixed(1) : 'N/A';
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const copyComparisonUrl = () => {
    if (selectedModelSlugs.length >= 2) {
      const url = `${window.location.origin}/models/compare?models=${selectedModelSlugs.join(',')}`;
      navigator.clipboard.writeText(url);
      alert('Comparison URL copied to clipboard!');
    }
  };

  return (
    <ModelsThemeProvider>
      <div className="models-scope min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/models" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <FaArrowLeft className="mr-2" /> Back to Models
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-red-600" />
              Compare AI Models
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleCompare}
                disabled={loading || selectedModelSlugs.length < 2}
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
              >
                {loading
                  ? 'Comparing...'
                  : `Compare ${selectedModelSlugs.length} Model${selectedModelSlugs.length !== 1 ? 's' : ''}`}
              </button>
              {selectedModelSlugs.length >= 2 && (
                <button
                  type="button"
                  onClick={copyComparisonUrl}
                  className="inline-flex items-center justify-center px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Copy comparison URL"
                >
                  <FaCopy />
                </button>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-4 mb-6">
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchQuery && filteredModels.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearchResults(false);
                  }
                }}
                placeholder="Search models by name, developer, or type..."
                className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {showSearchResults && searchQuery && !modelsLoading && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredModels.length > 0 ? (
                    filteredModels
                      .filter(m => !selectedModelSlugs.includes(m.slug))
                      .map((model) => (
                        <button
                          key={model.id}
                          onClick={() => addModel(model.slug)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                          type="button"
                        >
                          {model.logo_url ? (
                            <img src={model.logo_url} alt={model.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <FaBrain className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{model.name}</p>
                            <p className="text-sm text-gray-600 truncate">{model.developer || 'Unknown'}</p>
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      {selectedModelSlugs.length >= 5 
                        ? 'Maximum 5 models can be compared. Remove one to add another.'
                        : 'No models found matching your search.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Models */}
            {selectedModelSlugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedModelSlugs.map((slug) => {
                  const model = allModels.find(m => m.slug === slug);
                  if (!model) return null;
                  return (
                    <div
                      key={slug}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg"
                    >
                      <span className="font-medium">{model.name}</span>
                      <button
                        onClick={() => removeModel(slug)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {comparison.length > 0 && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparison.map((model) => (
                <div key={model.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {model.logo_url ? (
                      <img src={model.logo_url} alt={model.name} className="w-12 h-12 rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <FaBrain className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{model.name}</h3>
                      {model.developer && (
                        <p className="text-sm text-gray-600">{model.developer}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/models/${model.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>

            {/* Detailed Comparison Table */}
            <ComparisonTable
              models={comparison}
              fields={[
                { key: 'developer', label: 'Developer / Organization', compare: 'none' },
                { key: 'model_type', label: 'Model Type', compare: 'none' },
                { key: 'architecture', label: 'Architecture', compare: 'none' },
                { key: 'parameters', label: 'Parameter Count', compare: 'none' },
                {
                  key: 'context_length',
                  label: 'Context Length',
                  compare: 'higher',
                  render: (value) => (value ? `${Number(value).toLocaleString()} tokens` : '—'),
                },
                { key: 'license', label: 'License', compare: 'none' },
                {
                  key: 'rating',
                  label: 'Rating',
                  type: 'rating',
                  compare: 'higher',
                  render: (value, model) => (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span className="font-semibold">{formatRating(value)}</span>
                      <span className="text-sm text-gray-600">({model.rating_count || 0})</span>
                    </div>
                  ),
                },
                {
                  key: 'download_count',
                  label: 'Downloads',
                  compare: 'higher',
                  render: (value) => (
                    <div className="flex items-center gap-2">
                      <FaDownload className="text-blue-600" />
                      <span>{formatNumber(Number(value) || 0)}</span>
                    </div>
                  ),
                },
                ...(comparison.some((m) => m.github_stats?.stars)
                  ? [{
                      key: 'github_stats',
                      label: 'GitHub Stars',
                      compare: 'none' as const,
                      render: (value: any) => (value?.stars ? formatNumber(value.stars) : '—'),
                    }]
                  : []),
                {
                  key: 'pricing_type',
                  label: 'Availability',
                  compare: 'none',
                  render: (value) => (
                    <span className={`px-2 py-1 rounded text-xs ${
                      value === 'free' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {value === 'free' ? 'Open-source' : 'Paid / API'}
                    </span>
                  ),
                },
              ]}
            />

            {/* Performance Comparison */}
            {comparison.some(m => m.benchmarks && Object.keys(m.benchmarks).length > 0) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-red-600" />
                  Performance Comparison
                </h2>
                <p className="text-gray-600 mb-4">
                  Detailed benchmark comparison is available on individual model pages.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparison.map((model) => (
                    <Link
                      key={model.id}
                      href={`/models/${model.slug}`}
                      className="p-4 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold mb-2">{model.name}</h3>
                      <p className="text-sm text-gray-600">
                        View detailed benchmarks →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Comparison */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Share This Comparison</h3>
              <p className="text-red-100 mb-4">
                Share this comparison with others by copying the URL.
              </p>
              <button
                onClick={copyComparisonUrl}
                className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold flex items-center gap-2"
              >
                <FaCopy />
                Copy Comparison URL
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </ModelsThemeProvider>
  );
}
