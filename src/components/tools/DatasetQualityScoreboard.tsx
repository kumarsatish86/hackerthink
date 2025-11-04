'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaAward, FaStar, FaChartLine, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  quality_score?: number;
  rating: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  logo_url?: string;
}

function DatasetQualityScoreboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'quality' | 'rating' | 'downloads'>('quality');

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    sortDatasets();
  }, [sortBy]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/datasets?status=published&limit=100');
      const data = await response.json();
      
      // Filter datasets with quality scores or ratings
      const withScores = (data.datasets || [])
        .filter((d: Dataset) => (d.quality_score && d.quality_score > 0) || (d.rating && d.rating > 0));
      
      setDatasets(withScores);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortDatasets = () => {
    const sorted = [...datasets].sort((a, b) => {
      if (sortBy === 'quality') {
        const scoreA = a.quality_score || a.rating || 0;
        const scoreB = b.quality_score || b.rating || 0;
        return scoreB - scoreA;
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return (b.download_count || 0) - (a.download_count || 0);
      }
    });
    setDatasets(sorted);
  };

  const getQualityColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 4.0) return 'text-blue-600 bg-blue-100';
    if (score >= 3.5) return 'text-yellow-600 bg-yellow-100';
    if (score >= 3.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  // Prepare chart data
  const chartData = datasets.slice(0, 10).map((d, idx) => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    quality: d.quality_score || d.rating || 0,
    rating: d.rating || 0,
    downloads: Math.log10(d.download_count || 1) // Use log scale for better visualization
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Sort */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaAward className="text-red-600" />
          Dataset Quality Scoreboard
        </h2>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'quality' | 'rating' | 'downloads')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="quality">Quality Score</option>
            <option value="rating">Rating</option>
            <option value="downloads">Downloads</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-red-600" />
            Top 10 Datasets Comparison
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quality" fill="#ef4444" name="Quality Score" />
              <Bar dataKey="rating" fill="#f59e0b" name="Rating" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quality Scoreboard Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datasets.map((dataset, index) => {
                const qualityScore = dataset.quality_score || dataset.rating || 0;
                return (
                  <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-bold text-gray-600">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/datasets/${dataset.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        {dataset.logo_url ? (
                          <img
                            src={dataset.logo_url}
                            alt={dataset.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <FaDatabase className="text-red-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-red-600">
                            {dataset.name}
                          </div>
                          {dataset.provider && (
                            <div className="text-sm text-gray-600">{dataset.provider}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {qualityScore > 0 ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(qualityScore)}`}>
                          <FaAward className="mr-1" />
                          {qualityScore.toFixed(2)}/5.0
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold">{dataset.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-sm text-gray-500">({dataset.rating_count || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaDownload className="text-blue-500" />
                        <span>{formatNumber(dataset.download_count || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dataset.dataset_type ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {dataset.dataset_type}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {datasets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No datasets with quality scores found.</p>
        </div>
      )}
    </div>
  );
}

// Export info sections component
export function DatasetQualityScoreboardInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Understanding Quality Scores</h2>
        <p className="text-gray-700 mb-4">
          Quality scores rate datasets based on various factors including data cleanliness, completeness, 
          documentation, and community feedback.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              4.5 - 5.0
            </span>
            <span className="text-gray-700">Excellent quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              4.0 - 4.4
            </span>
            <span className="text-gray-700">High quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              3.5 - 3.9
            </span>
            <span className="text-gray-700">Good quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              3.0 - 3.4
            </span>
            <span className="text-gray-700">Fair quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              &lt; 3.0
            </span>
            <span className="text-gray-700">Needs improvement</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DatasetQualityScoreboard;
export { DatasetQualityScoreboard };
