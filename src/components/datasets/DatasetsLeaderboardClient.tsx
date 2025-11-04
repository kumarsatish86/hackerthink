'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaDownload, FaStar, FaTrophy, FaChartLine } from 'react-icons/fa';

interface LeaderboardDataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  view_count: number;
  logo_url?: string;
  rank: number;
}

export default function DatasetsLeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('download_count'); // download_count, rating, view_count
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, selectedType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      params.append('limit', '100');
      if (selectedType) params.append('dataset_type', selectedType);
      params.append('sort', sortBy);
      params.append('order', 'desc');

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();
      
      const datasets = (data.datasets || []).map((dataset: LeaderboardDataset, index: number) => ({
        ...dataset,
        rank: index + 1
      }));
      
      setLeaderboard(datasets);
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

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
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
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="download_count">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="view_count">Most Viewed</option>
            <option value="rating_count">Most Rated</option>
          </select>
          
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Types</option>
            <option value="Text">Text</option>
            <option value="Image">Image</option>
            <option value="Audio">Audio</option>
            <option value="Video">Video</option>
            <option value="Multimodal">Multimodal</option>
            <option value="Tabular">Tabular</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaDownload /> Downloads
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaStar /> Rating
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaChartLine /> Views
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRankIcon(dataset.rank) ? (
                        <span className="text-2xl">{getRankIcon(dataset.rank)}</span>
                      ) : (
                        <span className={`text-lg font-bold ${getRankColor(dataset.rank)}`}>
                          #{dataset.rank}
                        </span>
                      )}
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
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {dataset.provider || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dataset.dataset_type ? (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {dataset.dataset_type}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaDownload className="text-blue-500" />
                      <span className="font-semibold">{formatNumber(dataset.download_count || 0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span className="font-semibold">{formatRating(dataset.rating)}</span>
                      <span className="text-xs text-gray-500">({dataset.rating_count || 0})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-green-500" />
                      <span className="font-semibold">{formatNumber(dataset.view_count || 0)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">No datasets found.</p>
        </div>
      )}
    </div>
  );
}

