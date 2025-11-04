'use client';

import React from 'react';
import { FaDatabase, FaLink, FaFileAlt } from 'react-icons/fa';

interface TrainingDataSource {
  id: string;
  dataset_name: string;
  data_source_url?: string;
  token_count?: string | number;
  description?: string;
  dataset_type?: string;
}

interface TrainingDataListProps {
  trainingData: TrainingDataSource[];
  showDescription?: boolean;
  maxDisplay?: number;
}

export default function TrainingDataList({
  trainingData,
  showDescription = true,
  maxDisplay
}: TrainingDataListProps) {
  if (!trainingData || trainingData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaDatabase className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No training data information available</p>
      </div>
    );
  }

  const displayData = maxDisplay ? trainingData.slice(0, maxDisplay) : trainingData;

  const formatTokenCount = (count: string | number | undefined) => {
    if (!count) return '—';
    if (typeof count === 'number') {
      if (count >= 1e12) return `${(count / 1e12).toFixed(1)}T`;
      if (count >= 1e9) return `${(count / 1e9).toFixed(1)}B`;
      if (count >= 1e6) return `${(count / 1e6).toFixed(1)}M`;
      if (count >= 1e3) return `${(count / 1e3).toFixed(1)}K`;
      return count.toString();
    }
    return String(count);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y">
        {displayData.map((source) => (
          <div key={source.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FaDatabase className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{source.dataset_name}</h3>
                  {source.dataset_type && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mb-2">
                      {source.dataset_type}
                    </span>
                  )}
                  {showDescription && source.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{source.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
              {source.token_count && (
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-gray-400" />
                  <span>
                    <span className="font-medium">Tokens:</span>{' '}
                    {formatTokenCount(source.token_count)}
                  </span>
                </div>
              )}
              {source.data_source_url && (
                <a
                  href={source.data_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <FaLink />
                  <span>Source Link</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {maxDisplay && trainingData.length > maxDisplay && (
        <div className="px-6 py-4 bg-gray-50 border-t text-center text-sm text-gray-600">
          Showing {maxDisplay} of {trainingData.length} training data sources
        </div>
      )}
    </div>
  );
}

