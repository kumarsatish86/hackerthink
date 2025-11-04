'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FaBrain, FaArrowLeft, FaStar, FaChartLine, FaDownload, FaGavel, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCode,
  FaUsers, FaEye, FaCopy, FaTrash
} from 'react-icons/fa';

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

  const compareModels = async (slugs?: string[]) => {
    const slugsToCompare = slugs || selectedModelSlugs;
    
    if (slugsToCompare.length < 2) {
      return;
    }

    if (slugsToCompare.length > 5) {
      alert('Maximum 5 models can be compared at once');
      return;
    }

    setLoading(true);
    try {
      const slugsParam = slugsToCompare.join(',');
      const response = await fetch(`/api/models/compare?slugs=${slugsParam}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setComparison(data.models || []);
        // Update URL without reload
        window.history.pushState({}, '', `/models/compare?models=${slugsParam}`);
      }
    } catch (error) {
      console.error('Error comparing models:', error);
      alert('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load only published models for search (draft models should not appear)
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const response = await fetch('/api/models?status=published&limit=1000');
        if (!response.ok) {
          throw new Error(`Failed to load models: ${response.statusText}`);
        }
        const data = await response.json();
        const models = data.models || [];
        console.log('Loaded published models:', models.length, 'models');
        if (models.length > 0) {
          console.log('Sample model:', models[0].name);
          console.log('All model names:', models.map((m: AIModel) => m.name));
          console.log('All model slugs:', models.map((m: AIModel) => m.slug));
          console.log('All developers:', models.map((m: AIModel) => m.developer).filter(Boolean));
          
          // Check specifically for ibm-granite
          const ibmModel = models.find((m: AIModel) => 
            m.name?.toLowerCase().includes('ibm') || 
            m.developer?.toLowerCase().includes('ibm') ||
            m.slug?.toLowerCase().includes('ibm') ||
            m.name?.toLowerCase().includes('granite') ||
            m.developer?.toLowerCase().includes('granite') ||
            m.slug?.toLowerCase().includes('granite')
          );
          if (ibmModel) {
            console.log('✅ Found IBM model:', {
              name: ibmModel.name,
              developer: ibmModel.developer,
              slug: ibmModel.slug,
              status: ibmModel.status
            });
          } else {
            console.log('❌ IBM model NOT found in loaded models');
            // Show full list for debugging
            console.log('Full models list:', models.map((m: AIModel) => ({
              name: m.name,
              slug: m.slug,
              developer: m.developer,
              status: m.status
            })));
          }
        }
        setAllModels(models);
      } catch (err) {
        console.error('Error loading models:', err);
        setAllModels([]);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();

    // Check for slugs in URL params
    const slugsParam = searchParams.get('models');
    if (slugsParam) {
      const slugs = slugsParam.split(',').filter(Boolean);
      setSelectedModelSlugs(slugs);
      // Note: compareModels will be called after models are loaded
    }
  }, [searchParams]);

  // Compare models when slugs are in URL and models are loaded
  useEffect(() => {
    const slugsParam = searchParams.get('models');
    if (slugsParam && allModels.length > 0) {
      const slugs = slugsParam.split(',').filter(Boolean);
      if (slugs.length >= 2) {
        compareModels(slugs);
      }
    }
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
    const filtered = allModels.filter(model => {
      const name = (model.name || '').toLowerCase();
      const developer = (model.developer || '').toLowerCase();
      const modelType = (model.model_type || '').toLowerCase();
      const slug = (model.slug || '').toLowerCase();
      
      const matches = name.includes(query) ||
             developer.includes(query) ||
             modelType.includes(query) ||
             slug.includes(query);
      
      // Debug specific search for ibm-granite
      if (query.includes('ibm') || query.includes('granite')) {
        console.log('Checking model:', {
          name,
          developer,
          slug,
          query,
          nameMatch: name.includes(query),
          developerMatch: developer.includes(query),
          slugMatch: slug.includes(query),
          matches
        });
      }
      
      return matches;
    });

    console.log(`Search query: "${searchQuery}"`, {
      totalModels: allModels.length,
      filteredCount: filtered.length,
      sampleResults: filtered.slice(0, 3).map(m => ({ name: m.name, developer: m.developer, slug: m.slug }))
    });

    return filtered.slice(0, 10);
  }, [searchQuery, allModels]);

  const addModel = (slug: string) => {
    if (!selectedModelSlugs.includes(slug) && selectedModelSlugs.length < 5) {
      const newSelection = [...selectedModelSlugs, slug];
      setSelectedModelSlugs(newSelection);
      setSearchQuery('');
      setShowSearchResults(false);
      
      // Auto-compare if we now have 2 or more models
      if (newSelection.length >= 2) {
        compareModels(newSelection);
      }
    } else if (selectedModelSlugs.length >= 5) {
      alert('Maximum 5 models can be compared at once');
    }
  };

  const removeModel = (slug: string) => {
    const newSelection = selectedModelSlugs.filter(s => s !== slug);
    setSelectedModelSlugs(newSelection);
    
    // Update comparison if we have models
    if (newSelection.length >= 2) {
      compareModels(newSelection);
    } else {
      setComparison([]);
    }
  };

  const handleCompare = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FaChartLine className="text-red-600" />
            Compare AI Models
          </h1>

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

            <div className="flex gap-3">
              <button
                onClick={handleCompare}
                disabled={loading || selectedModelSlugs.length < 2}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Comparing...' : `Compare ${selectedModelSlugs.length} Model${selectedModelSlugs.length !== 1 ? 's' : ''}`}
              </button>
              {selectedModelSlugs.length >= 2 && (
                <button
                  onClick={copyComparisonUrl}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Copy comparison URL"
                >
                  <FaCopy />
                </button>
              )}
            </div>
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Property</th>
                      {comparison.map((model) => (
                        <th key={model.id} className="px-4 py-3 text-left min-w-[200px]">
                          <div className="flex items-center gap-2">
                            {model.logo_url && (
                              <img src={model.logo_url} alt={model.name} className="w-6 h-6 rounded" />
                            )}
                            <span className="font-semibold">{model.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Developer / Organization</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">{model.developer || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Model Type</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">{model.model_type || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Architecture</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">{model.architecture || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Parameter Count</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3 font-semibold">{model.parameters || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Context Length</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">
                          {model.context_length ? `${model.context_length.toLocaleString()} tokens` : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">License</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">{model.license || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Rating</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span className="font-semibold">{formatRating(model.rating)}</span>
                            <span className="text-sm text-gray-600">({model.rating_count || 0})</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Downloads</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaDownload className="text-blue-600" />
                            <span>{formatNumber(model.download_count || 0)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    {comparison.some(m => m.github_stats) && (
                      <tr>
                        <td className="px-4 py-3 font-medium bg-gray-50">GitHub Stars</td>
                        {comparison.map((model) => (
                          <td key={model.id} className="px-4 py-3">
                            {model.github_stats?.stars ? formatNumber(model.github_stats.stars) : '—'}
                          </td>
                        ))}
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Availability</td>
                      {comparison.map((model) => (
                        <td key={model.id} className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            model.pricing_type === 'free' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {model.pricing_type === 'free' ? 'Open-source' : 'Paid / API'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

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
  );
}
