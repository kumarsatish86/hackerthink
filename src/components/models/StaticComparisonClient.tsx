'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBrain, FaDownload, FaStar, FaCheckCircle, FaTimesCircle,
  FaArrowRight, FaRocket, FaCode, FaGavel, FaChartLine, FaUsers,
  FaExclamationTriangle, FaThumbsUp, FaThumbsDown, FaTrophy,
  FaBuilding, FaEye, FaGithub
} from 'react-icons/fa';

interface ComparisonModel {
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
  github_url?: string;
  huggingface_url?: string;
  api_endpoint?: string;
  capabilities?: string[];
  use_cases?: string[];
  github_stats?: {
    stars?: number;
    forks?: number;
    issues?: number;
  };
  benchmarks_list?: Array<{
    benchmark_name: string;
    score: number | string;
    category?: string;
  }>;
}

interface StaticComparisonClientProps {
  modelASlug: string;
  modelBSlug: string;
}

export default function StaticComparisonClient({ modelASlug, modelBSlug }: StaticComparisonClientProps) {
  const [modelA, setModelA] = useState<ComparisonModel | null>(null);
  const [modelB, setModelB] = useState<ComparisonModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparison();
  }, [modelASlug, modelBSlug]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/models/compare?slugs=${modelASlug},${modelBSlug}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        const models = data.models || [];
        if (models.length >= 2) {
          setModelA(models.find((m: ComparisonModel) => m.slug === modelASlug) || models[0]);
          setModelB(models.find((m: ComparisonModel) => m.slug === modelBSlug) || models[1]);
        } else if (models.length === 1) {
          setModelA(models[0]);
          setError(`Model "${models[0].slug === modelASlug ? modelBSlug : modelASlug}" not found`);
        } else {
          setError('Both models not found');
        }
      }
    } catch (error) {
      console.error('Error fetching comparison:', error);
      setError('Failed to load comparison');
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

  const formatScore = (score: any) => {
    if (!score) return '—';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    if (isNaN(num)) return score;
    return num.toFixed(2);
  };

  const compareValues = (a: any, b: any, type: 'higher' | 'lower' = 'higher') => {
    if (!a && !b) return { winner: null, difference: null };
    if (!a) return { winner: 'b', difference: null };
    if (!b) return { winner: 'a', difference: null };
    
    const aNum = typeof a === 'number' ? a : parseFloat(String(a));
    const bNum = typeof b === 'number' ? b : parseFloat(String(b));
    
    if (isNaN(aNum) || isNaN(bNum)) return { winner: null, difference: null };
    
    if (type === 'higher') {
      if (aNum > bNum) {
        const diff = ((aNum - bNum) / bNum) * 100;
        return { winner: 'a', difference: diff.toFixed(1) };
      } else if (bNum > aNum) {
        const diff = ((bNum - aNum) / aNum) * 100;
        return { winner: 'b', difference: diff.toFixed(1) };
      }
    }
    
    return { winner: null, difference: '0' };
  };

  if (loading && !modelA && !modelB) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !modelA || !modelB) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparison Not Available</h2>
        <p className="text-gray-600 mb-6">{error || 'Both models are required for comparison'}</p>
        <Link
          href="/models/compare"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaArrowRight />
          Use Comparison Tool
        </Link>
      </div>
    );
  }

  // Calculate performance deltas
  const ratingComparison = compareValues(modelA.rating, modelB.rating, 'higher');
  const downloadsComparison = compareValues(modelA.download_count, modelB.download_count, 'higher');
  const starsComparison = compareValues(
    modelA.github_stats?.stars,
    modelB.github_stats?.stars,
    'higher'
  );

  return (
    <div className="space-y-6">
      {/* Model Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model A */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-500">
          <Link href={`/models/${modelA.slug}`} className="block hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-4 mb-4">
              {modelA.logo_url ? (
                <img src={modelA.logo_url} alt={modelA.name} className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                  <FaBrain className="text-red-600 text-2xl" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{modelA.name}</h2>
                {modelA.developer && (
                  <p className="text-gray-600">{modelA.developer}</p>
                )}
              </div>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-3">
              {modelA.description || 'No description available'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">{formatRating(modelA.rating)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaDownload className="text-blue-600" />
                <span>{formatNumber(modelA.download_count || 0)}</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-red-600 font-medium">
              View Details →
            </div>
          </Link>
        </div>

        {/* Model B */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
          <Link href={`/models/${modelB.slug}`} className="block hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-4 mb-4">
              {modelB.logo_url ? (
                <img src={modelB.logo_url} alt={modelB.name} className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FaBrain className="text-blue-600 text-2xl" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{modelB.name}</h2>
                {modelB.developer && (
                  <p className="text-gray-600">{modelB.developer}</p>
                )}
              </div>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-3">
              {modelB.description || 'No description available'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">{formatRating(modelB.rating)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaDownload className="text-blue-600" />
                <span>{formatNumber(modelB.download_count || 0)}</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-600 font-medium">
              View Details →
            </div>
          </Link>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaChartLine />
            Detailed Comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Property</th>
                <th className="px-6 py-4 text-left font-semibold min-w-[250px]">{modelA.name}</th>
                <th className="px-6 py-4 text-left font-semibold min-w-[250px]">{modelB.name}</th>
                <th className="px-6 py-4 text-left font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Basic Overview */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 font-bold text-lg">Basic Overview</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Developer / Organization</td>
                <td className="px-6 py-4">
                  {modelA.developer ? (
                    <Link
                      href={`/models/org/${modelA.developer.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {modelA.developer}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  {modelB.developer ? (
                    <Link
                      href={`/models/org/${modelB.developer.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {modelB.developer}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Model Type</td>
                <td className="px-6 py-4">{modelA.model_type || '—'}</td>
                <td className="px-6 py-4">{modelB.model_type || '—'}</td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">License</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {modelA.license || '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {modelB.license || '—'}
                  </span>
                </td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Availability</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    modelA.pricing_type === 'free' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {modelA.pricing_type === 'free' ? 'Open-source' : 'Paid / API'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    modelB.pricing_type === 'free' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {modelB.pricing_type === 'free' ? 'Open-source' : 'Paid / API'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {modelA.pricing_type === 'free' && modelB.pricing_type !== 'free' ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <FaTrophy /> {modelA.name}
                    </span>
                  ) : modelB.pricing_type === 'free' && modelA.pricing_type !== 'free' ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <FaTrophy /> {modelB.name}
                    </span>
                  ) : '—'}
                </td>
              </tr>

              {/* Technical Specifications */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 font-bold text-lg">Technical Specifications</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Architecture</td>
                <td className="px-6 py-4">{modelA.architecture || '—'}</td>
                <td className="px-6 py-4">{modelB.architecture || '—'}</td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Parameter Count</td>
                <td className="px-6 py-4 font-semibold">{modelA.parameters || '—'}</td>
                <td className="px-6 py-4 font-semibold">{modelB.parameters || '—'}</td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Context Length</td>
                <td className="px-6 py-4">
                  {modelA.context_length ? `${modelA.context_length.toLocaleString()} tokens` : '—'}
                </td>
                <td className="px-6 py-4">
                  {modelB.context_length ? `${modelB.context_length.toLocaleString()} tokens` : '—'}
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const comparison = compareValues(modelA.context_length, modelB.context_length, 'higher');
                    if (comparison.winner === 'a') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaArrowRight className="transform rotate-90" />
                          {modelA.name} (+{comparison.difference}%)
                        </span>
                      );
                    } else if (comparison.winner === 'b') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaArrowRight className="transform -rotate-90" />
                          {modelB.name} (+{comparison.difference}%)
                        </span>
                      );
                    }
                    return '—';
                  })()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Version</td>
                <td className="px-6 py-4">{modelA.version || '—'}</td>
                <td className="px-6 py-4">{modelB.version || '—'}</td>
                <td className="px-6 py-4">—</td>
              </tr>

              {/* Performance & Popularity */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 font-bold text-lg">Performance & Popularity</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Rating</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{formatRating(modelA.rating)}</span>
                    <span className="text-sm text-gray-500">({modelA.rating_count || 0})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{formatRating(modelB.rating)}</span>
                    <span className="text-sm text-gray-500">({modelB.rating_count || 0})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const comparison = ratingComparison;
                    if (comparison.winner === 'a') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaTrophy /> {modelA.name} (+{comparison.difference}%)
                        </span>
                      );
                    } else if (comparison.winner === 'b') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaTrophy /> {modelB.name} (+{comparison.difference}%)
                        </span>
                      );
                    }
                    return '—';
                  })()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Downloads</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaDownload className="text-blue-600" />
                    <span className="font-semibold">{formatNumber(modelA.download_count || 0)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FaDownload className="text-blue-600" />
                    <span className="font-semibold">{formatNumber(modelB.download_count || 0)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const comparison = downloadsComparison;
                    if (comparison.winner === 'a') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaTrophy /> {modelA.name} (+{comparison.difference}%)
                        </span>
                      );
                    } else if (comparison.winner === 'b') {
                      return (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <FaTrophy /> {modelB.name} (+{comparison.difference}%)
                        </span>
                      );
                    }
                    return '—';
                  })()}
                </td>
              </tr>
              {modelA.github_stats || modelB.github_stats ? (
                <tr>
                  <td className="px-6 py-4 font-medium">GitHub Stars</td>
                  <td className="px-6 py-4">
                    {modelA.github_stats?.stars ? (
                      <div className="flex items-center gap-2">
                        <FaGithub />
                        <span>{formatNumber(modelA.github_stats.stars)}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {modelB.github_stats?.stars ? (
                      <div className="flex items-center gap-2">
                        <FaGithub />
                        <span>{formatNumber(modelB.github_stats.stars)}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const comparison = starsComparison;
                      if (comparison.winner === 'a') {
                        return (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <FaTrophy /> {modelA.name} (+{comparison.difference}%)
                          </span>
                        );
                      } else if (comparison.winner === 'b') {
                        return (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <FaTrophy /> {modelB.name} (+{comparison.difference}%)
                          </span>
                        );
                      }
                      return '—';
                    })()}
                  </td>
                </tr>
              ) : null}

              {/* Benchmarks Comparison */}
              {(modelA.benchmarks_list && modelA.benchmarks_list.length > 0) || 
               (modelB.benchmarks_list && modelB.benchmarks_list.length > 0) ? (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-3 font-bold text-lg">Benchmarks</td>
                  </tr>
                  {(() => {
                    // Get unique benchmarks from both models
                    const allBenchmarks = new Set<string>();
                    modelA.benchmarks_list?.forEach((b: any) => allBenchmarks.add(b.benchmark_name));
                    modelB.benchmarks_list?.forEach((b: any) => allBenchmarks.add(b.benchmark_name));
                    
                    return Array.from(allBenchmarks).slice(0, 10).map((benchmarkName) => {
                      const aBenchmark = modelA.benchmarks_list?.find((b: any) => b.benchmark_name === benchmarkName);
                      const bBenchmark = modelB.benchmarks_list?.find((b: any) => b.benchmark_name === benchmarkName);
                      const comparison = compareValues(
                        aBenchmark?.score,
                        bBenchmark?.score,
                        'higher'
                      );
                      
                      return (
                        <tr key={benchmarkName}>
                          <td className="px-6 py-4 font-medium">{benchmarkName}</td>
                          <td className="px-6 py-4 font-semibold">
                            {aBenchmark ? formatScore(aBenchmark.score) : '—'}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {bBenchmark ? formatScore(bBenchmark.score) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            {comparison.winner === 'a' ? (
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <FaTrophy /> {modelA.name} (+{comparison.difference}%)
                              </span>
                            ) : comparison.winner === 'b' ? (
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <FaTrophy /> {modelB.name} (+{comparison.difference}%)
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </>
              ) : null}

              {/* Links */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 font-bold text-lg">Official Links</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">GitHub</td>
                <td className="px-6 py-4">
                  {modelA.github_url ? (
                    <a href={modelA.github_url} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                      <FaGithub /> {modelA.github_url.split('/').pop()}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  {modelB.github_url ? (
                    <a href={modelB.github_url} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                      <FaGithub /> {modelB.github_url.split('/').pop()}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">—</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">HuggingFace</td>
                <td className="px-6 py-4">
                  {modelA.huggingface_url ? (
                    <a href={modelA.huggingface_url} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 hover:underline">
                      HuggingFace →
                    </a>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  {modelB.huggingface_url ? (
                    <a href={modelB.huggingface_url} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 hover:underline">
                      HuggingFace →
                    </a>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model A Strengths */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaThumbsUp className="text-green-600" />
            {modelA.name} Strengths
          </h3>
          <ul className="space-y-2">
            {modelA.pricing_type === 'free' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Open-source and free to use</span>
              </li>
            )}
            {modelA.parameters && modelB.parameters && (
              parseFloat(modelA.parameters.replace(/[^0-9.]/g, '')) > 
              parseFloat(modelB.parameters.replace(/[^0-9.]/g, '')) && (
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                  <span>Larger parameter count for potentially better performance</span>
                </li>
              )
            )}
            {modelA.context_length && modelB.context_length && 
             modelA.context_length > modelB.context_length && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Longer context length</span>
              </li>
            )}
            {ratingComparison.winner === 'a' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Higher user rating</span>
              </li>
            )}
            {downloadsComparison.winner === 'a' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>More popular (higher download count)</span>
              </li>
            )}
            {!modelA.strengths || modelA.strengths.length === 0 ? (
              <li className="text-gray-500 italic">No additional strengths specified</li>
            ) : null}
          </ul>
        </div>

        {/* Model B Strengths */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaThumbsUp className="text-green-600" />
            {modelB.name} Strengths
          </h3>
          <ul className="space-y-2">
            {modelB.pricing_type === 'free' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Open-source and free to use</span>
              </li>
            )}
            {modelB.parameters && modelA.parameters && (
              parseFloat(modelB.parameters.replace(/[^0-9.]/g, '')) > 
              parseFloat(modelA.parameters.replace(/[^0-9.]/g, '')) && (
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                  <span>Larger parameter count for potentially better performance</span>
                </li>
              )
            )}
            {modelB.context_length && modelA.context_length && 
             modelB.context_length > modelA.context_length && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Longer context length</span>
              </li>
            )}
            {ratingComparison.winner === 'b' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>Higher user rating</span>
              </li>
            )}
            {downloadsComparison.winner === 'b' && (
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <span>More popular (higher download count)</span>
              </li>
            )}
            {!modelB.strengths || modelB.strengths.length === 0 ? (
              <li className="text-gray-500 italic">No additional strengths specified</li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Verdict / Recommendation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          Verdict & Recommendation
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Both models offer unique strengths. Here's a quick recommendation based on key factors:
          </p>
          
          <div className="bg-white rounded-lg p-4 space-y-3">
            {modelA.pricing_type === 'free' && modelB.pricing_type !== 'free' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelA.name}</span> is open-source and free,
                  making it the better choice for budget-conscious users or commercial applications.
                </div>
              </div>
            )}
            {modelB.pricing_type === 'free' && modelA.pricing_type !== 'free' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelB.name}</span> is open-source and free,
                  making it the better choice for budget-conscious users or commercial applications.
                </div>
              </div>
            )}
            {ratingComparison.winner === 'a' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelA.name}</span> has a higher user rating
                  ({formatRating(modelA.rating)} vs {formatRating(modelB.rating)}),
                  indicating better user satisfaction.
                </div>
              </div>
            )}
            {ratingComparison.winner === 'b' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelB.name}</span> has a higher user rating
                  ({formatRating(modelB.rating)} vs {formatRating(modelA.rating)}),
                  indicating better user satisfaction.
                </div>
              </div>
            )}
            {downloadsComparison.winner === 'a' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelA.name}</span> has significantly more downloads
                  ({formatNumber(modelA.download_count || 0)} vs {formatNumber(modelB.download_count || 0)}),
                  suggesting broader adoption and community support.
                </div>
              </div>
            )}
            {downloadsComparison.winner === 'b' && (
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{modelB.name}</span> has significantly more downloads
                  ({formatNumber(modelB.download_count || 0)} vs {formatNumber(modelA.download_count || 0)}),
                  suggesting broader adoption and community support.
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t mt-3">
              <p className="text-sm text-gray-600">
                <strong>Best for:</strong> Choose {modelA.name} if you need{' '}
                {modelA.pricing_type === 'free' ? 'an open-source solution' : 'an API-based solution'}.
                Choose {modelB.name} if you need{' '}
                {modelB.pricing_type === 'free' ? 'an open-source solution' : 'an API-based solution'}.
                Consider your specific use case, budget, and technical requirements when making your decision.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-2">Explore More Comparisons</h3>
        <p className="text-red-100 mb-4">
          Compare other models or create custom comparisons using our comparison tool.
        </p>
        <div className="flex gap-4">
          <Link
            href="/models/compare"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors"
          >
            <FaChartLine />
            Comparison Tool
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
          >
            <FaBrain />
            Browse All Models
          </Link>
        </div>
      </div>
    </div>
  );
}

