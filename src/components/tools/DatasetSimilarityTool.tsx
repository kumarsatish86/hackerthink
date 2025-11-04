'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaSearch, FaLink, FaDownload, FaStar } from 'react-icons/fa';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  domain?: string;
  license?: string;
  rating: number;
  download_count: number;
  logo_url?: string;
  description?: string;
}

function DatasetSimilarityTool() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [similarDatasets, setSimilarDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets?status=published&limit=500');
      const data = await response.json();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const findSimilar = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setLoading(true);

    // Simulate similarity calculation
    setTimeout(() => {
      const similar = datasets
        .filter(d => d.id !== dataset.id)
        .map(d => {
          let score = 0;
          
          // Same type
          if (d.dataset_type === dataset.dataset_type) score += 3;
          
          // Same domain
          if (d.domain === dataset.domain) score += 2;
          
          // Same license
          if (d.license === dataset.license) score += 1;
          
          // Provider match
          if (d.provider === dataset.provider) score += 1;

          return { ...d, similarityScore: score };
        })
        .filter(d => d.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10)
        .map(({ similarityScore, ...rest }) => rest);

      setSimilarDatasets(similar);
      setLoading(false);
    }, 500);
  };

  const filteredDatasets = datasets.filter(d => 
    searchQuery === '' || 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.provider?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20);

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Search and Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaSearch className="text-red-600" />
          Find Similar Datasets
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a dataset..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Dataset List */}
          {searchQuery && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {filteredDatasets.map((dataset) => (
                <button
                  key={dataset.id}
                  onClick={() => findSimilar(dataset)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 transition-colors"
                >
                  {dataset.logo_url ? (
                    <img
                      src={dataset.logo_url}
                      alt={dataset.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <FaDatabase className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dataset.name}</p>
                    <p className="text-sm text-gray-600 truncate">{dataset.provider || 'Unknown'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Dataset */}
      {selectedDataset && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaLink className="text-red-600" />
            Selected Dataset
          </h3>
          <Link
            href={`/datasets/${selectedDataset.slug}`}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
          >
            {selectedDataset.logo_url ? (
              <img
                src={selectedDataset.logo_url}
                alt={selectedDataset.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                <FaDatabase className="text-red-600 w-8 h-8" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">{selectedDataset.name}</h4>
              <p className="text-sm text-gray-600">{selectedDataset.provider}</p>
              {selectedDataset.dataset_type && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {selectedDataset.dataset_type}
                </span>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Similar Datasets */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : similarDatasets.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Similar Datasets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarDatasets.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/datasets/${dataset.slug}`}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
              >
                {dataset.logo_url ? (
                  <img
                    src={dataset.logo_url}
                    alt={dataset.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                    <FaDatabase className="text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{dataset.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{dataset.provider}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {dataset.dataset_type && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {dataset.dataset_type}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{dataset.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaDownload className="text-blue-400" />
                      <span>{formatNumber(dataset.download_count || 0)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!selectedDataset && !searchQuery && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FaDatabase className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">
            Search for a dataset above to find similar datasets
          </p>
        </div>
      )}
    </div>
  );
}

// Export info sections component
export function DatasetSimilarityToolInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">How Similarity Matching Works</h2>
        <p className="text-gray-700 mb-4">
          The similarity tool finds datasets similar to your selected dataset based on several factors:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Dataset Type:</strong> Datasets of the same type (e.g., Text, Image, Audio)</li>
          <li><strong>Domain:</strong> Datasets from the same application domain</li>
          <li><strong>License:</strong> Datasets with compatible licenses</li>
          <li><strong>Provider:</strong> Datasets from the same organization or provider</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Find alternative datasets when one is unavailable or restricted</li>
          <li>Discover datasets that might work for similar use cases</li>
          <li>Compare datasets in the same category or domain</li>
          <li>Explore datasets from the same provider or organization</li>
        </ul>
      </section>
    </div>
  );
}

export default DatasetSimilarityTool;
export { DatasetSimilarityTool };
