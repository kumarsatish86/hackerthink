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
  const [benchmarkNames, setBenchmarkNames] = useState<string[]>([]);
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
        setBenchmarkNames(data.meta?.benchmark_names || []);
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
      setBenchmarkNames([]);
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

  const parseParamToBillions = (value: unknown): number | null => {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const s = String(value).trim();
    const m = s.match(/^([\d.]+)\s*([KMBT])?/i);
    if (!m) return null;
    const n = parseFloat(m[1]);
    if (!Number.isFinite(n)) return null;
    const u = (m[2] || 'B').toUpperCase();
    if (u === 'T') return n * 1000;
    if (u === 'B') return n;
    if (u === 'M') return n / 1000;
    if (u === 'K') return n / 1e6;
    return n;
  };

  const comparisonFields = useMemo(() => {
    const base = [
      // Identity
      { key: 'developer', label: 'Developer / Organization', category: 'Identity & Overview', compare: 'none' as const, hideIfEmpty: false },
      { key: 'task_label', label: 'Task / Pipeline', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'model_type', label: 'Model Type', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'model_family', label: 'Model Family', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'architecture', label: 'Architecture', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'architecture_family', label: 'Architecture Family', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'version', label: 'Version', category: 'Identity & Overview', compare: 'none' as const },
      { key: 'release_date_label', label: 'Release Date', category: 'Identity & Overview', compare: 'none' as const },
      {
        key: 'description',
        label: 'Summary',
        category: 'Identity & Overview',
        compare: 'none' as const,
        render: (value: unknown) =>
          value ? (
            <span className="text-sm text-gray-700 line-clamp-3">{String(value)}</span>
          ) : (
            '—'
          ),
      },

      // Specs
      {
        key: 'param_display',
        label: 'Parameters',
        category: 'Technical Specs',
        compare: 'higher' as const,
        compareValue: (v: unknown, model: AIModel) =>
          (model as any).param_count_numeric ?? parseParamToBillions(v) ?? parseParamToBillions((model as any).parameters),
        hideIfEmpty: false,
      },
      {
        key: 'context_length',
        label: 'Context Length',
        category: 'Technical Specs',
        compare: 'higher' as const,
        render: (value: unknown) => (value ? `${Number(value).toLocaleString()} tokens` : '—'),
      },
      { key: 'tokenizer', label: 'Tokenizer', category: 'Technical Specs', compare: 'none' as const },
      {
        key: 'vocabulary_size',
        label: 'Vocabulary Size',
        category: 'Technical Specs',
        compare: 'higher' as const,
        render: (value: unknown) => (value ? Number(value).toLocaleString() : '—'),
      },
      { key: 'framework_label', label: 'Framework', category: 'Technical Specs', compare: 'none' as const },
      { key: 'training_framework', label: 'Training Framework', category: 'Technical Specs', compare: 'none' as const },
      { key: 'input_types', label: 'Input Types', category: 'Technical Specs', type: 'list' as const, compare: 'none' as const },
      { key: 'output_types', label: 'Output Types', category: 'Technical Specs', type: 'list' as const, compare: 'none' as const },
      { key: 'quantized_versions', label: 'Quantized Versions', category: 'Technical Specs', type: 'list' as const, compare: 'none' as const },

      // Capabilities
      { key: 'capabilities', label: 'Capabilities', category: 'Capabilities', type: 'list' as const, compare: 'none' as const },
      { key: 'categories', label: 'Categories', category: 'Capabilities', type: 'list' as const, compare: 'none' as const },
      { key: 'tags', label: 'Tags', category: 'Capabilities', type: 'list' as const, compare: 'none' as const },

      // Hardware
      { key: 'inference_speed_label', label: 'Inference Speed', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'memory_footprint_label', label: 'Memory Footprint', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'gpu_requirement', label: 'GPU', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'vram_requirement', label: 'VRAM', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'ram_requirement', label: 'RAM', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'cpu_requirement', label: 'CPU', category: 'Hardware & Runtime', compare: 'none' as const },
      { key: 'disk_requirement', label: 'Disk / Storage', category: 'Hardware & Runtime', compare: 'none' as const },

      // Licensing
      { key: 'license', label: 'License', category: 'Licensing & Access', compare: 'none' as const, hideIfEmpty: false },
      { key: 'commercial_use_label', label: 'Commercial Use', category: 'Licensing & Access', compare: 'none' as const },
      {
        key: 'pricing_type',
        label: 'Availability',
        category: 'Licensing & Access',
        compare: 'none' as const,
        hideIfEmpty: false,
        render: (value: unknown) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              value === 'free' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {value === 'free' ? 'Open-source' : 'Paid / API'}
          </span>
        ),
      },
      { key: 'huggingface_url', label: 'Hugging Face', category: 'Licensing & Access', type: 'link' as const, compare: 'none' as const },
      { key: 'github_url', label: 'GitHub', category: 'Licensing & Access', type: 'link' as const, compare: 'none' as const },
      { key: 'homepage_url', label: 'Homepage', category: 'Licensing & Access', type: 'link' as const, compare: 'none' as const },
      { key: 'verified', label: 'Verified', category: 'Licensing & Access', type: 'boolean' as const, compare: 'none' as const },
      { key: 'security_badge', label: 'Security Badge', category: 'Licensing & Access', type: 'boolean' as const, compare: 'none' as const },

      // Popularity
      {
        key: 'rating',
        label: 'Rating',
        category: 'Popularity & Trust',
        type: 'rating' as const,
        compare: 'higher' as const,
        hideIfEmpty: false,
        render: (value: unknown, model: AIModel) => (
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            <span className="font-semibold">{formatRating(Number(value))}</span>
            <span className="text-sm text-gray-600">({model.rating_count || 0})</span>
          </div>
        ),
      },
      {
        key: 'download_count',
        label: 'Downloads',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        hideIfEmpty: false,
        render: (value: unknown) => (
          <div className="flex items-center gap-2">
            <FaDownload className="text-blue-600" />
            <span>{formatNumber(Number(value) || 0)}</span>
          </div>
        ),
      },
      {
        key: 'likes_display',
        label: 'Likes',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        render: (value: unknown) => formatNumber(Number(value) || 0),
      },
      {
        key: 'stars_display',
        label: 'Stars',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        render: (value: unknown) => formatNumber(Number(value) || 0),
      },
      {
        key: 'github_stars',
        label: 'GitHub Stars',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        render: (value: unknown) => formatNumber(Number(value) || 0),
      },
      {
        key: 'github_forks',
        label: 'GitHub Forks',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        render: (value: unknown) => formatNumber(Number(value) || 0),
      },
      {
        key: 'view_count',
        label: 'Views',
        category: 'Popularity & Trust',
        compare: 'higher' as const,
        render: (value: unknown) => formatNumber(Number(value) || 0),
      },
      {
        key: 'trending_rank',
        label: 'Trending Rank',
        category: 'Popularity & Trust',
        compare: 'lower' as const,
      },

      // Training
      {
        key: 'training_dataset_count',
        label: 'Training Datasets (count)',
        category: 'Training Data',
        compare: 'higher' as const,
      },
      {
        key: 'training_datasets',
        label: 'Training Datasets',
        category: 'Training Data',
        type: 'list' as const,
        compare: 'none' as const,
      },
      {
        key: 'training_datasets_linked',
        label: 'Linked on HackerThink',
        category: 'Training Data',
        type: 'list' as const,
        compare: 'none' as const,
      },

      // Safety
      { key: 'known_biases', label: 'Known Biases', category: 'Safety & Ethics', type: 'list' as const, compare: 'none' as const },
      { key: 'ethical_risks', label: 'Ethical Risks', category: 'Safety & Ethics', type: 'list' as const, compare: 'none' as const },
      {
        key: 'evaluation_summary',
        label: 'Evaluation Summary',
        category: 'Safety & Ethics',
        compare: 'none' as const,
        render: (value: unknown) =>
          value ? <span className="text-sm text-gray-700 line-clamp-3">{String(value)}</span> : '—',
      },
    ];

    const benchmarkFields = benchmarkNames.map((name) => ({
      key: `benchmark__${name}`,
      label: name,
      category: 'Benchmarks & Performance',
      compare: 'higher' as const,
      render: (value: unknown) =>
        value == null || value === '' ? '—' : (
          <span className="font-semibold">{Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        ),
    }));

    return [...base, ...benchmarkFields];
  }, [benchmarkNames]);

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
              fields={comparisonFields}
            />

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
