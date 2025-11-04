'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FaDatabase, FaArrowLeft, FaStar, FaChartLine, FaDownload, FaGavel, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCode,
  FaUsers, FaEye, FaCopy, FaLanguage, FaTag, FaGlobe
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
  columns?: number;
  language?: string;
  languages?: string[];
  domain?: string;
  license?: string;
  version?: string;
  release_date?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  logo_url?: string;
  huggingface_url?: string;
  github_url?: string;
  paper_url?: string;
  quality_score?: number;
  task_types?: string[];
  categories?: string[];
}

export default function DatasetComparisonPage() {
  const searchParams = useSearchParams();
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetSlugs, setSelectedDatasetSlugs] = useState<string[]>([]);
  const [comparison, setComparison] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const compareDatasets = async (slugs?: string[]) => {
    const slugsToCompare = slugs || selectedDatasetSlugs;
    
    if (slugsToCompare.length < 2) {
      return;
    }

    if (slugsToCompare.length > 5) {
      alert('Maximum 5 datasets can be compared at once');
      return;
    }

    setLoading(true);
    try {
      const slugsParam = slugsToCompare.join(',');
      const response = await fetch(`/api/datasets/compare?slugs=${slugsParam}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setComparison(data.datasets || []);
        // Update URL without reload
        window.history.pushState({}, '', `/datasets/compare?datasets=${slugsParam}`);
      }
    } catch (error) {
      console.error('Error comparing datasets:', error);
      alert('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load only published datasets for search
    const loadDatasets = async () => {
      setDatasetsLoading(true);
      try {
        const response = await fetch('/api/datasets?status=published&limit=1000');
        if (!response.ok) {
          throw new Error(`Failed to load datasets: ${response.statusText}`);
        }
        const data = await response.json();
        const datasets = data.datasets || [];
        setAllDatasets(datasets);
      } catch (err) {
        console.error('Error loading datasets:', err);
        setAllDatasets([]);
      } finally {
        setDatasetsLoading(false);
      }
    };

    loadDatasets();

    // Check for slugs in URL params
    const slugsParam = searchParams.get('datasets');
    if (slugsParam) {
      const slugs = slugsParam.split(',').filter(Boolean);
      setSelectedDatasetSlugs(slugs);
    }
  }, [searchParams]);

  // Compare datasets when slugs are in URL and datasets are loaded
  useEffect(() => {
    const slugsParam = searchParams.get('datasets');
    if (slugsParam && allDatasets.length > 0) {
      const slugs = slugsParam.split(',').filter(Boolean);
      if (slugs.length >= 2) {
        compareDatasets(slugs);
      }
    }
  }, [allDatasets.length, searchParams]);

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

  const filteredDatasets = useMemo(() => {
    if (!searchQuery.trim() || !allDatasets.length) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allDatasets.filter(dataset => {
      const name = (dataset.name || '').toLowerCase();
      const provider = (dataset.provider || '').toLowerCase();
      const datasetType = (dataset.dataset_type || '').toLowerCase();
      const slug = (dataset.slug || '').toLowerCase();
      
      return name.includes(query) ||
             provider.includes(query) ||
             datasetType.includes(query) ||
             slug.includes(query);
    });

    return filtered.slice(0, 10);
  }, [searchQuery, allDatasets]);

  const addDataset = (slug: string) => {
    if (!selectedDatasetSlugs.includes(slug) && selectedDatasetSlugs.length < 5) {
      const newSelection = [...selectedDatasetSlugs, slug];
      setSelectedDatasetSlugs(newSelection);
      setSearchQuery('');
      setShowSearchResults(false);
      
      // Auto-compare if we now have 2 or more datasets
      if (newSelection.length >= 2) {
        compareDatasets(newSelection);
      }
    } else if (selectedDatasetSlugs.length >= 5) {
      alert('Maximum 5 datasets can be compared at once');
    }
  };

  const removeDataset = (slug: string) => {
    const newSelection = selectedDatasetSlugs.filter(s => s !== slug);
    setSelectedDatasetSlugs(newSelection);
    
    // Update comparison if we have datasets
    if (newSelection.length >= 2) {
      compareDatasets(newSelection);
    } else {
      setComparison([]);
    }
  };

  const handleCompare = () => {
    compareDatasets();
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
    if (selectedDatasetSlugs.length >= 2) {
      const url = `${window.location.origin}/datasets/compare?datasets=${selectedDatasetSlugs.join(',')}`;
      navigator.clipboard.writeText(url);
      alert('Comparison URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/datasets" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Datasets
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FaChartLine className="text-red-600" />
            Compare Datasets
          </h1>

          {/* Dataset Selector */}
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
                  if (searchQuery && filteredDatasets.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearchResults(false);
                  }
                }}
                placeholder="Search datasets by name, provider, or type..."
                className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {showSearchResults && searchQuery && !datasetsLoading && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredDatasets.length > 0 ? (
                    filteredDatasets
                      .filter(d => !selectedDatasetSlugs.includes(d.slug))
                      .map((dataset) => (
                        <button
                          key={dataset.id}
                          onClick={() => addDataset(dataset.slug)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                          type="button"
                        >
                          {dataset.logo_url ? (
                            <img src={dataset.logo_url} alt={dataset.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <FaDatabase className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{dataset.name}</p>
                            <p className="text-sm text-gray-600 truncate">{dataset.provider || 'Unknown'}</p>
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      {selectedDatasetSlugs.length >= 5 
                        ? 'Maximum 5 datasets can be compared. Remove one to add another.'
                        : 'No datasets found matching your search.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Datasets */}
            {selectedDatasetSlugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDatasetSlugs.map((slug) => {
                  const dataset = allDatasets.find(d => d.slug === slug);
                  if (!dataset) return null;
                  return (
                    <div
                      key={slug}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg"
                    >
                      <span className="font-medium">{dataset.name}</span>
                      <button
                        onClick={() => removeDataset(slug)}
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
                disabled={loading || selectedDatasetSlugs.length < 2}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Comparing...' : `Compare ${selectedDatasetSlugs.length} Dataset${selectedDatasetSlugs.length !== 1 ? 's' : ''}`}
              </button>
              {selectedDatasetSlugs.length >= 2 && (
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
              {comparison.map((dataset) => (
                <div key={dataset.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {dataset.logo_url ? (
                      <img src={dataset.logo_url} alt={dataset.name} className="w-12 h-12 rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <FaDatabase className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{dataset.name}</h3>
                      {dataset.provider && (
                        <p className="text-sm text-gray-600">{dataset.provider}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/datasets/${dataset.slug}`}
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
                      {comparison.map((dataset) => (
                        <th key={dataset.id} className="px-4 py-3 text-left min-w-[200px]">
                          <div className="flex items-center gap-2">
                            {dataset.logo_url && (
                              <img src={dataset.logo_url} alt={dataset.name} className="w-6 h-6 rounded" />
                            )}
                            <span className="font-semibold">{dataset.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Provider / Organization</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.provider || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Dataset Type</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.dataset_type || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Version</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.version || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Release Date</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          {dataset.release_date ? new Date(dataset.release_date).toLocaleDateString() : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Dataset Size</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3 font-semibold">{dataset.size || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Number of Records</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          {dataset.rows ? `${dataset.rows.toLocaleString()} records` : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Languages</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          {dataset.languages && dataset.languages.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {dataset.languages.slice(0, 3).map((lang, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {lang}
                                </span>
                              ))}
                              {dataset.languages.length > 3 && (
                                <span className="text-xs text-gray-600">+{dataset.languages.length - 3}</span>
                              )}
                            </div>
                          ) : dataset.language ? (
                            dataset.language
                          ) : (
                            '—'
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Data Format</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.format || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">License</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.license || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Rating</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            <span className="font-semibold">{formatRating(dataset.rating)}</span>
                            <span className="text-sm text-gray-600">({dataset.rating_count || 0})</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Downloads</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaDownload className="text-blue-600" />
                            <span>{formatNumber(dataset.download_count || 0)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Views</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaEye className="text-green-600" />
                            <span>{formatNumber(dataset.view_count || 0)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Quality Score</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          {dataset.quality_score ? `${dataset.quality_score}/5.0` : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Intended Use</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          {dataset.task_types && dataset.task_types.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {dataset.task_types.slice(0, 3).map((task, idx) => (
                                <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {task}
                                </span>
                              ))}
                              {dataset.task_types.length > 3 && (
                                <span className="text-xs text-gray-600">+{dataset.task_types.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Domain</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">{dataset.domain || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">Access Links</td>
                      {comparison.map((dataset) => (
                        <td key={dataset.id} className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {dataset.huggingface_url && (
                              <a href={dataset.huggingface_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                HuggingFace
                              </a>
                            )}
                            {dataset.github_url && (
                              <a href={dataset.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                GitHub
                              </a>
                            )}
                            {dataset.paper_url && (
                              <a href={dataset.paper_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                Paper
                              </a>
                            )}
                            {!dataset.huggingface_url && !dataset.github_url && !dataset.paper_url && '—'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Recommendations</h3>
              <p className="text-red-100 mb-4">
                {comparison.length === 2 ? (
                  `Compare these datasets side by side to understand their strengths and use cases. Each dataset serves different purposes and may be better suited for specific tasks.`
                ) : (
                  `Compare these ${comparison.length} datasets to find the best fit for your needs. Consider factors like size, language support, license, and intended use cases.`
                )}
              </p>
            </div>

            {/* Share Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Share This Comparison</h3>
              <p className="text-gray-600 mb-4">
                Share this comparison with others by copying the URL.
              </p>
              <button
                onClick={copyComparisonUrl}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
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
