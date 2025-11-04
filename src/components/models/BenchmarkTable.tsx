'use client';

import React from 'react';
import { FaChartLine, FaTrophy, FaMedal, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Benchmark {
  benchmark_name: string;
  score: number | string;
  category?: string;
  metric_type?: string;
  dataset_name?: string;
  evaluation_date?: string;
  details?: any;
}

interface BenchmarkTableProps {
  benchmarks: Benchmark[];
  showCategory?: boolean;
  showRanking?: boolean;
  maxDisplay?: number;
  highlightBest?: boolean;
}

export default function BenchmarkTable({
  benchmarks,
  showCategory = true,
  showRanking = false,
  maxDisplay,
  highlightBest = true
}: BenchmarkTableProps) {
  if (!benchmarks || benchmarks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaChartLine className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No benchmarks available</p>
      </div>
    );
  }

  const displayBenchmarks = maxDisplay ? benchmarks.slice(0, maxDisplay) : benchmarks;
  
  // Sort by score if possible
  const sortedBenchmarks = [...displayBenchmarks].sort((a, b) => {
    const scoreA = typeof a.score === 'number' ? a.score : parseFloat(String(a.score || 0));
    const scoreB = typeof b.score === 'number' ? b.score : parseFloat(String(b.score || 0));
    if (isNaN(scoreA) || isNaN(scoreB)) return 0;
    return scoreB - scoreA;
  });

  const formatScore = (score: any) => {
    if (!score) return '—';
    const num = typeof score === 'number' ? score : parseFloat(String(score));
    if (isNaN(num)) return String(score);
    return num.toFixed(2);
  };

  const getBestScore = () => {
    let best = 0;
    sortedBenchmarks.forEach(benchmark => {
      const score = typeof benchmark.score === 'number' 
        ? benchmark.score 
        : parseFloat(String(benchmark.score || 0));
      if (!isNaN(score) && score > best) {
        best = score;
      }
    });
    return best;
  };

  const bestScore = highlightBest ? getBestScore() : null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {showRanking && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Benchmark</th>
              {showCategory && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
              {sortedBenchmarks.some(b => b.metric_type) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
              )}
              {sortedBenchmarks.some(b => b.dataset_name) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dataset</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedBenchmarks.map((benchmark, index) => {
              const score = typeof benchmark.score === 'number' 
                ? benchmark.score 
                : parseFloat(String(benchmark.score || 0));
              const isBest = highlightBest && bestScore !== null && score === bestScore && !isNaN(score);

              return (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 transition-colors ${
                    isBest ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                  }`}
                >
                  {showRanking && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <FaTrophy className="text-yellow-500" />}
                        {index === 1 && <FaMedal className="text-gray-400" />}
                        {index === 2 && <FaMedal className="text-amber-600" />}
                        <span className={`font-semibold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-500' :
                          index === 2 ? 'text-amber-700' :
                          'text-gray-600'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {benchmark.benchmark_name}
                      {isBest && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold flex items-center gap-1">
                          <FaTrophy /> Best
                        </span>
                      )}
                    </div>
                  </td>
                  {showCategory && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {benchmark.category ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {benchmark.category}
                        </span>
                      ) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`font-semibold text-lg ${
                      isBest ? 'text-yellow-700' : 'text-gray-900'
                    }`}>
                      {formatScore(benchmark.score)}
                    </span>
                  </td>
                  {sortedBenchmarks.some(b => b.metric_type) && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {benchmark.metric_type || '—'}
                    </td>
                  )}
                  {sortedBenchmarks.some(b => b.dataset_name) && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {benchmark.dataset_name || '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {maxDisplay && benchmarks.length > maxDisplay && (
        <div className="px-4 py-3 bg-gray-50 border-t text-center text-sm text-gray-600">
          Showing {maxDisplay} of {benchmarks.length} benchmarks
        </div>
      )}
    </div>
  );
}

