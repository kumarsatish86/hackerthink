'use client';

import React, { useState } from 'react';
import { FaCalculator, FaDatabase, FaChartLine } from 'react-icons/fa';

function DatasetTokenEstimator() {
  const [datasetSize, setDatasetSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState<'GB' | 'TB'>('GB');
  const [rows, setRows] = useState('');
  const [avgTokensPerRow, setAvgTokensPerRow] = useState('100');
  const [compressionRatio, setCompressionRatio] = useState('1');

  const calculateEstimates = () => {
    const sizeGB = sizeUnit === 'TB' ? parseFloat(datasetSize) * 1024 : parseFloat(datasetSize);
    const numRows = parseFloat(rows) || 0;
    const tokensPerRow = parseFloat(avgTokensPerRow) || 100;
    const compression = parseFloat(compressionRatio) || 1;

    if (!sizeGB && !numRows) return null;

    const estimates: {
      totalTokens?: number;
      storageGB?: number;
      storageTB?: number;
      downloadTime?: number;
      trainingTime?: string;
    } = {};

    // Estimate tokens from rows
    if (numRows > 0) {
      estimates.totalTokens = numRows * tokensPerRow;
    }

    // Estimate storage
    if (sizeGB > 0) {
      estimates.storageGB = sizeGB;
      estimates.storageTB = sizeGB / 1024;
      
      // Estimate download time (assuming average 100 Mbps connection)
      const downloadTimeMinutes = (sizeGB * 8) / (100 / 60); // Convert to minutes
      estimates.downloadTime = Math.round(downloadTimeMinutes);
    }

    // Estimate training time (rough approximation)
    if (estimates.totalTokens) {
      const tokensInB = estimates.totalTokens / 1e9;
      if (tokensInB < 0.1) estimates.trainingTime = 'A few hours';
      else if (tokensInB < 1) estimates.trainingTime = '1-3 days';
      else if (tokensInB < 10) estimates.trainingTime = '1-2 weeks';
      else if (tokensInB < 100) estimates.trainingTime = '2-4 weeks';
      else estimates.trainingTime = '1-2 months+';
    }

    return estimates;
  };

  const estimates = calculateEstimates();

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaCalculator className="text-red-600" />
          Dataset Token & Storage Estimator
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dataset Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={datasetSize}
                onChange={(e) => setDatasetSize(e.target.value)}
                placeholder="e.g., 100"
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as 'GB' | 'TB')}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>

          {/* Number of Rows */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rows/Records
            </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              placeholder="e.g., 1000000"
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Average Tokens per Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Tokens per Row
            </label>
            <input
              type="number"
              value={avgTokensPerRow}
              onChange={(e) => setAvgTokensPerRow(e.target.value)}
              placeholder="100"
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Typical: 50-200 tokens for text data
            </p>
          </div>

          {/* Compression Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Ratio (if compressed)
            </label>
            <input
              type="number"
              value={compressionRatio}
              onChange={(e) => setCompressionRatio(e.target.value)}
              placeholder="1"
              min="0.1"
              step="0.1"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              1 = no compression, &lt;1 = compressed
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {estimates && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-red-600" />
            Estimated Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {estimates.totalTokens && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaDatabase className="text-blue-600" />
                  <p className="text-sm font-medium text-gray-700">Total Tokens</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(estimates.totalTokens)}
                </p>
              </div>
            )}

            {estimates.storageGB && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDatabase className="text-green-600" />
                    <p className="text-sm font-medium text-gray-700">Storage (GB)</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {estimates.storageGB.toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDatabase className="text-purple-600" />
                    <p className="text-sm font-medium text-gray-700">Storage (TB)</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {estimates.storageTB?.toFixed(3)}
                  </p>
                </div>
              </>
            )}

            {estimates.downloadTime && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartLine className="text-yellow-600" />
                  <p className="text-sm font-medium text-gray-700">Download Time</p>
                </div>
                <p className="text-2xl font-bold text-yellow-900">
                  ~{estimates.downloadTime} min
                </p>
                <p className="text-xs text-gray-500 mt-1">@ 100 Mbps</p>
              </div>
            )}

            {estimates.trainingTime && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartLine className="text-red-600" />
                  <p className="text-sm font-medium text-gray-700">Training Time</p>
                </div>
                <p className="text-lg font-bold text-red-900">
                  {estimates.trainingTime}
                </p>
                <p className="text-xs text-gray-500 mt-1">Approximate</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Token estimates are approximate and vary by tokenizer</li>
              <li>Download times assume average internet connection speeds</li>
              <li>Training times are rough estimates and depend on hardware and model size</li>
              <li>Storage requirements may vary based on data format and compression</li>
            </ul>
          </div>
        </div>
      )}

      {!estimates && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <FaCalculator className="mx-auto w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">
            Enter dataset size or number of rows to calculate estimates
          </p>
        </div>
      )}
    </div>
  );
}

// Export info sections component
export function DatasetTokenEstimatorInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">How Token Estimation Works</h2>
        <p className="text-gray-700 mb-4">
          Token estimation helps you plan storage, download, and training requirements for your dataset.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Tokens:</strong> Approximate token count based on rows and average tokens per row</li>
          <li><strong>Storage:</strong> Disk space required to store the dataset</li>
          <li><strong>Download Time:</strong> Estimated time to download at 100 Mbps connection</li>
          <li><strong>Training Time:</strong> Rough estimate based on dataset size (varies significantly by hardware)</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Tips for Planning</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Use token estimates to plan model training requirements</li>
          <li>Consider storage costs for large datasets</li>
          <li>Plan download time for datasets hosted remotely</li>
          <li>Factor in data preprocessing and cleaning time</li>
          <li>Account for backup and version control storage needs</li>
        </ul>
      </section>
    </div>
  );
}

export default DatasetTokenEstimator;
export { DatasetTokenEstimator };
