'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBrain, FaDownload, FaStar, FaTrophy, FaChartLine, FaFilter,
  FaMedal, FaCrown, FaAward, FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';

interface LeaderboardModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  model_type?: string;
  parameters?: string;
  architecture?: string;
  license?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  logo_url?: string;
  benchmarks: Array<{
    benchmark_name: string;
    score: number | string;
    category?: string;
    metric_type?: string;
    dataset_name?: string;
  }>;
  bestScores: Record<string, any>;
}

export default function ModelsLeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [availableBenchmarks, setAvailableBenchmarks] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedBenchmark, selectedCategory, sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (selectedBenchmark) params.append('benchmark', selectedBenchmark);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sort_by', sortBy);

      const response = await fetch(`/api/models/leaderboard?${params.toString()}`);
      const data = await response.json();
      
      setLeaderboard(data.leaderboard || []);
      if (data.filterOptions) {
        setAvailableBenchmarks(data.filterOptions.benchmarks || []);
        setAvailableCategories(data.filterOptions.categories || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  const getRankIcon = (index: number) => {
    if (index === 0) return <FaCrown className="text-yellow-500" />;
    if (index === 1) return <FaMedal className="text-gray-400" />;
    if (index === 2) return <FaMedal className="text-amber-600" />;
    return null;
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaFilter className="text-red-600" />
          Filter Leaderboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benchmark
            </label>
            <select
              value={selectedBenchmark}
              onChange={(e) => setSelectedBenchmark(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Benchmarks</option>
              {availableBenchmarks.map((benchmark) => (
                <option key={benchmark} value={benchmark}>{benchmark}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="score">Benchmark Score</option>
              <option value="downloads">Downloads</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedBenchmark('');
                setSelectedCategory('');
                setSortBy('score');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaTrophy className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No models found matching the selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left font-semibold">Model</th>
                  <th className="px-6 py-4 text-left font-semibold">Developer</th>
                  <th className="px-6 py-4 text-left font-semibold">Type</th>
                  <th className="px-6 py-4 text-left font-semibold">Parameters</th>
                  <th className="px-6 py-4 text-left font-semibold">Top Benchmarks</th>
                  <th className="px-6 py-4 text-left font-semibold">Rating</th>
                  <th className="px-6 py-4 text-left font-semibold">Downloads</th>
                  <th className="px-6 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaderboard.map((model, index) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-600' :
                          'text-gray-600'
                        }`}>
                          #{index + 1}
                        </span>
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/models/${model.slug}`}
                        className="flex items-center gap-3 hover:text-red-600 transition-colors"
                      >
                        {model.logo_url ? (
                          <img src={model.logo_url} alt={model.name} className="w-10 h-10 rounded" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                            <FaBrain className="text-red-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{model.name}</div>
                          {model.architecture && (
                            <div className="text-xs text-gray-500">{model.architecture}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {model.developer ? (
                        <Link
                          href={`/models/org/${model.developer.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {model.developer}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {model.model_type || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{model.parameters || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {Object.entries(model.bestScores).slice(0, 3).map(([benchmark, score]) => (
                          <div key={benchmark} className="text-sm">
                            <span className="font-medium text-gray-700">{benchmark}:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatScore(score)}
                            </span>
                          </div>
                        ))}
                        {model.benchmarks.length > 3 && (
                          <div className="text-xs text-gray-500">
                            + {model.benchmarks.length - 3} more
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold">{formatRating(model.rating)}</span>
                        <span className="text-xs text-gray-500">({model.rating_count || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaDownload className="text-blue-600" />
                        <span>{formatNumber(model.download_count || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/models/${model.slug}`}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          About the Leaderboard
        </h3>
        <p className="text-gray-700 text-sm">
          This leaderboard ranks AI models based on their benchmark performance. Models are ranked by their best scores
          across various benchmarks including MMLU, GSM8K, HumanEval, and more. Use the filters above to focus on specific
          benchmarks or categories. Rankings are updated regularly as new benchmark results are published.
        </p>
      </div>
    </div>
  );
}

