"use client";

import React, { useState } from 'react';

interface StorageProvider {
  id: string;
  name: string;
  pricePerGBMonth: number; // Price per GB per month
  description: string;
  icon: string;
  color: string;
}

const storageProviders: StorageProvider[] = [
  {
    id: 'aws-s3',
    name: 'AWS S3 (Standard)',
    pricePerGBMonth: 0.023,
    description: 'Amazon S3 Standard storage',
    icon: '☁️',
    color: 'orange'
  },
  {
    id: 'aws-s3-ia',
    name: 'AWS S3 (Infrequent Access)',
    pricePerGBMonth: 0.0125,
    description: 'S3 Infrequent Access storage',
    icon: '☁️',
    color: 'orange'
  },
  {
    id: 'aws-s3-glacier',
    name: 'AWS S3 Glacier',
    pricePerGBMonth: 0.004,
    description: 'S3 Glacier for archival',
    icon: '❄️',
    color: 'blue'
  },
  {
    id: 'gcs',
    name: 'Google Cloud Storage (Standard)',
    pricePerGBMonth: 0.020,
    description: 'GCS Standard storage',
    icon: '🔵',
    color: 'blue'
  },
  {
    id: 'gcs-nearline',
    name: 'Google Cloud Storage (Nearline)',
    pricePerGBMonth: 0.010,
    description: 'GCS Nearline storage',
    icon: '🔵',
    color: 'blue'
  },
  {
    id: 'azure-blob',
    name: 'Azure Blob Storage (Hot)',
    pricePerGBMonth: 0.018,
    description: 'Azure Blob Hot tier',
    icon: '🔷',
    color: 'blue'
  },
  {
    id: 'azure-blob-cool',
    name: 'Azure Blob Storage (Cool)',
    pricePerGBMonth: 0.010,
    description: 'Azure Blob Cool tier',
    icon: '🔷',
    color: 'blue'
  }
];

interface CalculationResult {
  totalSizeGB: number;
  totalSizeTB: number;
  totalSizePB: number;
  rawSize: number;
  compressedSize: number;
  compressionRatio: number;
  providerCosts: Array<{
    provider: StorageProvider;
    monthlyCost: number;
    yearlyCost: number;
  }>;
}

function calculateDatasetSize(
  numRecords: number,
  avgFileSizeMB: number,
  compressionRatio: number = 1
): CalculationResult {
  const rawSizeGB = (numRecords * avgFileSizeMB) / 1024;
  const compressedSizeGB = rawSizeGB / compressionRatio;
  
  const totalSizeGB = compressedSizeGB;
  const totalSizeTB = totalSizeGB / 1024;
  const totalSizePB = totalSizeTB / 1024;

  const providerCosts = storageProviders.map(provider => ({
    provider,
    monthlyCost: totalSizeGB * provider.pricePerGBMonth,
    yearlyCost: totalSizeGB * provider.pricePerGBMonth * 12
  }));

  return {
    totalSizeGB,
    totalSizeTB,
    totalSizePB,
    rawSize: rawSizeGB,
    compressedSize: compressedSizeGB,
    compressionRatio,
    providerCosts: providerCosts.sort((a, b) => a.monthlyCost - b.monthlyCost)
  };
}

export function DatasetSizeStorageEstimator() {
  const [numRecords, setNumRecords] = useState<number>(1000000);
  const [avgFileSizeMB, setAvgFileSizeMB] = useState<number>(1);
  const [compressionRatio, setCompressionRatio] = useState<number>(1);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['aws-s3', 'gcs', 'azure-blob']);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (numRecords <= 0 || avgFileSizeMB <= 0) {
      alert('Please enter valid values for records and file size');
      return;
    }

    const calculation = calculateDatasetSize(numRecords, avgFileSizeMB, compressionRatio);
    setResults(calculation);
    setShowResults(true);
  };

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const handleClear = () => {
    setNumRecords(1000000);
    setAvgFileSizeMB(1);
    setCompressionRatio(1);
    setSelectedProviders(['aws-s3', 'gcs', 'azure-blob']);
    setResults(null);
    setShowResults(false);
  };

  const handleLoadExample = () => {
    setNumRecords(10000000);
    setAvgFileSizeMB(5);
    setCompressionRatio(2);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} PB`;
    }
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} TB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} MB`;
    }
    return `${bytes.toFixed(2)} B`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-green-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#059669" strokeWidth="2" fill="none"/>
        </svg>
        Dataset Size & Storage Estimator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-green-700">
              Number of Records/Files <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={numRecords}
              onChange={(e) => setNumRecords(parseInt(e.target.value) || 0)}
              placeholder="1000000"
              className="w-full p-4 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              Total number of files or records in your dataset
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-green-700">
              Average File Size (MB) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={avgFileSizeMB}
              onChange={(e) => setAvgFileSizeMB(parseFloat(e.target.value) || 0)}
              placeholder="1"
              className="w-full p-4 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              Average size of each file in megabytes
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-green-700">
              Compression Ratio
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={compressionRatio}
              onChange={(e) => setCompressionRatio(parseFloat(e.target.value) || 1)}
              placeholder="1"
              className="w-full p-4 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              Compression ratio (e.g., 2 for 50% compression, 1 for no compression)
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-green-700">
              Quick Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNumRecords(1000000);
                  setAvgFileSizeMB(1);
                  setCompressionRatio(1);
                }}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              >
                1M × 1MB
              </button>
              <button
                onClick={() => {
                  setNumRecords(10000000);
                  setAvgFileSizeMB(5);
                  setCompressionRatio(2);
                }}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              >
                10M × 5MB
              </button>
              <button
                onClick={handleLoadExample}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              >
                Example
              </button>
            </div>
          </div>
        </div>

        {/* Storage Provider Selection */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-green-700">
            Select Storage Providers to Compare
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {storageProviders.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderToggle(provider.id)}
                className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedProviders.includes(provider.id)
                    ? `border-${provider.color}-500 bg-${provider.color}-50`
                    : 'border-green-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{provider.icon}</span>
                  <span className={`font-bold text-sm ${
                    selectedProviders.includes(provider.id) ? `text-${provider.color}-800` : 'text-gray-900'
                  }`}>
                    {provider.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{provider.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${provider.pricePerGBMonth.toFixed(3)}/GB/month
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={numRecords <= 0 || avgFileSizeMB <= 0}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              numRecords > 0 && avgFileSizeMB > 0
                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Calculate Dataset Size & Costs
            </span>
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {showResults && results && (
        <div className="space-y-6">
          {/* Size Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Dataset Size Summary</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Size (Compressed)</p>
                <p className="text-2xl font-bold text-green-800">
                  {results.totalSizeGB.toFixed(2)} GB
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {results.totalSizeTB.toFixed(2)} TB
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Raw Size</p>
                <p className="text-2xl font-bold text-blue-800">
                  {results.rawSize.toFixed(2)} GB
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Before compression
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Compressed Size</p>
                <p className="text-2xl font-bold text-purple-800">
                  {results.compressedSize.toFixed(2)} GB
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  After compression
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Compression Ratio</p>
                <p className="text-2xl font-bold text-orange-800">
                  {results.compressionRatio.toFixed(1)}:1
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {((1 - 1/results.compressionRatio) * 100).toFixed(1)}% savings
                </p>
              </div>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Storage Cost Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Provider</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Price/GB/Month</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Monthly Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Yearly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {results.providerCosts
                    .filter(cost => selectedProviders.includes(cost.provider.id))
                    .map((cost, index) => (
                      <tr
                        key={cost.provider.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index === 0 ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cost.provider.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{cost.provider.name}</div>
                              <div className="text-xs text-gray-600">{cost.provider.description}</div>
                            </div>
                            {index === 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                                Cheapest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-3 text-gray-700">
                          {formatCurrency(cost.provider.pricePerGBMonth)}
                        </td>
                        <td className="text-right p-3">
                          <span className="font-bold text-green-800 text-lg">
                            {formatCurrency(cost.monthlyCost)}
                          </span>
                        </td>
                        <td className="text-right p-3">
                          <span className="font-bold text-blue-800">
                            {formatCurrency(cost.yearlyCost)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Savings */}
          {results.providerCosts.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">Cost Savings Analysis</h3>
              <div className="space-y-3">
                {results.providerCosts
                  .filter(cost => selectedProviders.includes(cost.provider.id))
                  .slice(1)
                  .map(cost => {
                    const cheapest = results.providerCosts[0];
                    const savings = cost.monthlyCost - cheapest.monthlyCost;
                    const savingsPercent = ((savings / cost.monthlyCost) * 100).toFixed(1);
                    
                    return (
                      <div key={cost.provider.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-gray-900">{cost.provider.name}</span>
                            <span className="text-gray-600"> vs </span>
                            <span className="font-semibold text-green-800">{cheapest.provider.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-red-800 text-lg">
                              {formatCurrency(savings)}/month
                            </span>
                            <div className="text-sm text-gray-600">
                              {savingsPercent}% more expensive
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-800 mb-3">💡 Recommendations</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
              <li>
                <strong>For active datasets:</strong> Use Standard tier storage (AWS S3, GCS Standard, Azure Hot)
              </li>
              <li>
                <strong>For infrequent access:</strong> Consider Infrequent Access or Nearline tiers for cost savings
              </li>
              <li>
                <strong>For archival:</strong> Use Glacier or Cool tiers for long-term storage at lower costs
              </li>
              <li>
                <strong>Compression:</strong> Enable compression to reduce storage costs by {((1 - 1/results.compressionRatio) * 100).toFixed(1)}%
              </li>
              <li>
                <strong>Data lifecycle:</strong> Move older data to cheaper storage tiers to optimize costs
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function DatasetSizeStorageEstimatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">What is a Dataset Size & Storage Estimator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          A <strong>Dataset Size & Storage Estimator</strong> is a practical tool for AI developers and data engineers 
          who need to estimate dataset sizes and storage costs. Enter the number of records, average file size, and 
          compression ratio, and the tool calculates approximate dataset size and monthly/yearly costs across different 
          cloud storage providers (AWS S3, Google Cloud Storage, Azure Blob Storage). Perfect for planning, budgeting, 
          and optimizing storage costs.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our Dataset Size & Storage Estimator calculates:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Dataset Size:</strong> Total size in GB, TB, and PB based on records and file size</li>
          <li><strong>Compression Savings:</strong> Calculates compressed size and compression ratio</li>
          <li><strong>Storage Costs:</strong> Monthly and yearly costs for each storage provider</li>
          <li><strong>Cost Comparison:</strong> Side-by-side comparison of different providers</li>
          <li><strong>Cost Savings:</strong> Shows potential savings between providers</li>
          <li><strong>Recommendations:</strong> Provides storage tier recommendations based on use case</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Supported Storage Providers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageProviders.map(provider => (
            <div key={provider.id} className={`bg-${provider.color}-50 p-4 rounded-lg border-2 border-${provider.color}-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{provider.icon}</span>
                <h3 className={`font-bold text-${provider.color}-800`}>{provider.name}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{provider.description}</p>
              <p className="text-xs text-gray-600">
                ${provider.pricePerGBMonth.toFixed(3)}/GB/month
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border-l-4 border-green-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Plan Budgets:</strong> Estimate storage costs before deploying datasets</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Compare Providers:</strong> See cost differences across cloud storage providers</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Optimize Costs:</strong> Find the most cost-effective storage solution</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Understand Compression:</strong> See how compression affects storage costs</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Make Informed Decisions:</strong> Choose storage tiers based on actual costs</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Accurate file sizes:</strong> Use actual average file sizes for better estimates</li>
          <li><strong>Consider compression:</strong> Factor in compression ratios for your file types</li>
          <li><strong>Compare multiple providers:</strong> Select several providers to see cost differences</li>
          <li><strong>Plan for growth:</strong> Estimate future dataset growth when calculating costs</li>
          <li><strong>Storage tiers:</strong> Consider different storage tiers based on access patterns</li>
          <li><strong>Factor in data transfer:</strong> Remember to include data transfer costs in your budget</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-3">✅ AI Developers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Estimate dataset storage costs</li>
              <li>• Plan ML training budgets</li>
              <li>• Compare cloud storage providers</li>
              <li>• Optimize storage costs</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-teal-200">
            <h3 className="font-bold text-teal-800 mb-3">✅ Data Engineers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Plan storage infrastructure</li>
              <li>• Budget for data projects</li>
              <li>• Compare storage tiers</li>
              <li>• Optimize data lifecycle</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-green-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter number of records/files</strong> in your dataset</li>
          <li><strong>Enter average file size</strong> in megabytes</li>
          <li><strong>Set compression ratio</strong> (1 for no compression, 2 for 50% compression, etc.)</li>
          <li><strong>Select storage providers</strong> to compare (AWS S3, GCS, Azure, etc.)</li>
          <li><strong>Click "Calculate"</strong> to see size and cost estimates</li>
          <li><strong>Review results</strong> showing dataset size and monthly/yearly costs</li>
          <li><strong>Compare providers</strong> to find the most cost-effective solution</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Note:</strong> Prices are estimates based on publicly available pricing. Actual costs may vary 
          based on region, volume discounts, and provider-specific terms. Always verify current pricing with 
          your cloud provider.
        </p>
      </section>
    </>
  );
}

export default DatasetSizeStorageEstimator;

