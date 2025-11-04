'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDatabase, FaBrain, FaSearch, FaLink } from 'react-icons/fa';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  dataset_type?: string;
  logo_url?: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  model_type?: string;
  logo_url?: string;
}

interface Relationship {
  datasetId: string;
  modelId: string;
  datasetName: string;
  modelName: string;
}

function DatasetModelMatrix() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [searchDataset, setSearchDataset] = useState('');
  const [searchModel, setSearchModel] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch datasets
      const datasetsRes = await fetch('/api/datasets?status=published&limit=200');
      const datasetsData = await datasetsRes.json();
      setDatasets(datasetsData.datasets || []);

      // Fetch models
      const modelsRes = await fetch('/api/models?status=published&limit=200');
      const modelsData = await modelsRes.json();
      setModels(modelsData.models || []);

      // Build relationships based on model training data
      // Fetch training data for a sample of models (for performance, limit to top 50)
      const topModels = modelsData.models?.slice(0, 50) || [];
      const rels: Relationship[] = [];

      // Process relationships from model training_data field
      modelsData.models?.forEach((model: any) => {
        if (model.training_data) {
          const trainingDataLower = model.training_data.toLowerCase();
          datasetsData.datasets?.forEach((dataset: Dataset) => {
            if (trainingDataLower.includes(dataset.name.toLowerCase())) {
              const exists = rels.find(r => r.datasetId === dataset.id && r.modelId === model.id);
              if (!exists) {
                rels.push({
                  datasetId: dataset.id,
                  modelId: model.id,
                  datasetName: dataset.name,
                  modelName: model.name,
                });
              }
            }
          });
        }
      });

      // Fetch detailed training data from individual model APIs (sample)
      const sampleModelSlugs = topModels.slice(0, 20).map((m: any) => m.slug);
      const modelDetailsPromises = sampleModelSlugs.map(async (slug: string) => {
        try {
          const res = await fetch(`/api/models/${slug}`);
          const data = await res.json();
          return data.model;
        } catch {
          return null;
        }
      });

      const modelDetails = await Promise.all(modelDetailsPromises);

      modelDetails.forEach((model: any) => {
        if (!model) return;

        if (model.training_data_sources && Array.isArray(model.training_data_sources)) {
          model.training_data_sources.forEach((source: any) => {
            const datasetName = source.dataset_name || source.name || '';
            if (!datasetName) return;

            const matchingDataset = datasetsData.datasets?.find((d: Dataset) => 
              d.name.toLowerCase().includes(datasetName.toLowerCase()) ||
              datasetName.toLowerCase().includes(d.name.toLowerCase()) ||
              d.slug.toLowerCase().includes(datasetName.toLowerCase().replace(/\s+/g, '-'))
            );
            
            if (matchingDataset) {
              const exists = rels.find(r => r.datasetId === matchingDataset.id && r.modelId === model.id);
              if (!exists) {
                rels.push({
                  datasetId: matchingDataset.id,
                  modelId: model.id,
                  datasetName: matchingDataset.name,
                  modelName: model.name,
                });
              }
            }
          });
        }
      });

      setRelationships(rels);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelsForDataset = (datasetId: string) => {
    return relationships
      .filter(r => r.datasetId === datasetId)
      .map(r => models.find(m => m.id === r.modelId))
      .filter(Boolean) as Model[];
  };

  const getDatasetsForModel = (modelId: string) => {
    return relationships
      .filter(r => r.modelId === modelId)
      .map(r => datasets.find(d => d.id === r.datasetId))
      .filter(Boolean) as Dataset[];
  };

  const filteredDatasets = datasets.filter(d =>
    searchDataset === '' || d.name.toLowerCase().includes(searchDataset.toLowerCase())
  ).slice(0, 20);

  const filteredModels = models.filter(m =>
    searchModel === '' || m.name.toLowerCase().includes(searchModel.toLowerCase())
  ).slice(0, 20);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaLink className="text-red-600" />
          Dataset-Model Relationship Matrix
        </h2>
        <p className="text-gray-600">
          Explore which datasets were used to train which models, and discover relationships between datasets and AI models.
        </p>
      </div>

      {/* Search Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Search */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaDatabase className="text-red-600" />
            Search Datasets
          </h3>
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchDataset}
              onChange={(e) => setSearchDataset(e.target.value)}
              placeholder="Search datasets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {searchDataset && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {filteredDatasets.map((dataset) => (
                <button
                  key={dataset.id}
                  onClick={() => setSelectedDataset(dataset)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 transition-colors ${
                    selectedDataset?.id === dataset.id ? 'bg-red-50' : ''
                  }`}
                >
                  {dataset.logo_url ? (
                    <img src={dataset.logo_url} alt={dataset.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                      <FaDatabase className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dataset.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Search */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaBrain className="text-red-600" />
            Search Models
          </h3>
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchModel}
              onChange={(e) => setSearchModel(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {searchModel && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 transition-colors ${
                    selectedModel?.id === model.id ? 'bg-red-50' : ''
                  }`}
                >
                  {model.logo_url ? (
                    <img src={model.logo_url} alt={model.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                      <FaBrain className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{model.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Dataset Results */}
      {selectedDataset && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaDatabase className="text-red-600" />
              Models Trained on: {selectedDataset.name}
            </h3>
            <button
              onClick={() => setSelectedDataset(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          {getModelsForDataset(selectedDataset.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getModelsForDataset(selectedDataset.id).map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                >
                  {model.logo_url ? (
                    <img src={model.logo_url} alt={model.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <FaBrain className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{model.name}</p>
                    {model.model_type && (
                      <p className="text-xs text-gray-500">{model.model_type}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No models found trained on this dataset.</p>
          )}
        </div>
      )}

      {/* Selected Model Results */}
      {selectedModel && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaBrain className="text-red-600" />
              Datasets Used by: {selectedModel.name}
            </h3>
            <button
              onClick={() => setSelectedModel(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          {getDatasetsForModel(selectedModel.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDatasetsForModel(selectedModel.id).map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.slug}`}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                >
                  {dataset.logo_url ? (
                    <img src={dataset.logo_url} alt={dataset.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <FaDatabase className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{dataset.name}</p>
                    {dataset.dataset_type && (
                      <p className="text-xs text-gray-500">{dataset.dataset_type}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No datasets found for this model.</p>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Relationship Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaDatabase className="text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Total Datasets</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{datasets.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaBrain className="text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Total Models</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{models.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaLink className="text-green-600" />
              <p className="text-sm font-medium text-gray-700">Relationships</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{relationships.length}</p>
          </div>
        </div>
      </div>

      {!selectedDataset && !selectedModel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FaLink className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Search for a dataset or model above to explore relationships
          </p>
          <p className="text-sm text-gray-500">
            Discover which models were trained on which datasets and vice versa
          </p>
        </div>
      )}
    </div>
  );
}

// Export info sections component
export function DatasetModelMatrixInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Understanding Dataset-Model Relationships</h2>
        <p className="text-gray-700 mb-4">
          This tool helps you explore the connections between datasets and AI models. Understanding these relationships 
          is crucial for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Finding datasets used to train specific models</li>
          <li>Discovering models that can be trained on specific datasets</li>
          <li>Understanding dataset impact on model performance</li>
          <li>Planning training strategies based on proven dataset-model combinations</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Search for a dataset to see which models were trained on it</li>
          <li>Search for a model to see which datasets it used for training</li>
          <li>Click on any result to view detailed information</li>
          <li>Use the statistics section to get an overview of relationships</li>
        </ul>
      </section>
    </div>
  );
}

export default DatasetModelMatrix;
export { DatasetModelMatrix };
