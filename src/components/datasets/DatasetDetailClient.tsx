'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { 
  FaDatabase, FaDownload, FaStar, FaCode, FaBook, FaRocket, FaChartLine, FaUsers,
  FaCalendar, FaGavel, FaShieldAlt, FaGraduationCap, FaCog, FaFileCode, FaCopy,
  FaCheckCircle, FaExclamationTriangle, FaLink, FaGitAlt, FaGithub, FaLanguage,
  FaEye, FaTools, FaHistory, FaProjectDiagram, FaBrain, FaTag, FaGlobe,
  FaLock, FaUnlock, FaLockOpen, FaFileAlt, FaFlask, FaBalanceScale, FaAward
} from 'react-icons/fa';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  description?: string;
  full_description?: string;
  dataset_type?: string;
  format?: string;
  size?: string;
  rows?: number;
  columns?: number;
  features?: any[];
  split_info?: any;
  language?: string;
  languages?: string[];
  domain?: string;
  task_types?: string[];
  license?: string;
  citation?: string;
  paper_url?: string;
  documentation_url?: string;
  download_url?: string;
  huggingface_url?: string;
  kaggle_url?: string;
  github_url?: string;
  sample_data?: any;
  preprocessing_info?: string;
  quality_score?: number;
  collection_method?: string;
  ethical_considerations?: string;
  release_date?: string;
  last_updated?: string;
  version?: string;
  logo_url?: string;
  featured_image?: string;
  rating: number;
  rating_count: number;
  view_count: number;
  download_count: number;
  categories?: string[];
  tags?: string[];
  schema_json?: any;
  
  // Related data
  models_trained_on_it?: Array<{
    id: string;
    name: string;
    slug: string;
    developer?: string;
    model_type?: string;
    parameters?: string;
    logo_url?: string;
  }>;
  similar_datasets?: Array<{
    id: string;
    name: string;
    slug: string;
    dataset_type?: string;
    domain?: string;
    rating?: number;
    download_count?: number;
    logo_url?: string;
  }>;
}

export default function DatasetDetailClient({ slug }: { slug: string }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/datasets/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setDataset(data.dataset);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dataset');
        setLoading(false);
      });
  }, [slug]);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate JSON-LD schema
  const generateSchema = () => {
    if (!dataset) return null;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      'name': dataset.name,
      'description': dataset.description || dataset.full_description || '',
      'url': `${baseUrl}/datasets/${dataset.slug}`,
      ...(dataset.version && { 'version': dataset.version }),
      ...(dataset.provider && { 
        'creator': {
          '@type': 'Organization',
          'name': dataset.provider
        }
      }),
      ...(dataset.release_date && {
        'datePublished': new Date(dataset.release_date).toISOString(),
      }),
      ...(dataset.license && {
        'license': dataset.license
      }),
      ...(dataset.huggingface_url && {
        'distribution': {
          '@type': 'DataDownload',
          'contentUrl': dataset.huggingface_url
        }
      }),
      ...(dataset.github_url && {
        'codeRepository': dataset.github_url
      }),
      ...(dataset.dataset_type && {
        'applicationCategory': dataset.dataset_type
      }),
      ...(dataset.keywords && {
        'keywords': dataset.tags?.join(', ') || dataset.categories?.join(', ')
      })
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaDatabase },
    { id: 'technical', label: 'Technical Specs', icon: FaCog },
    { id: 'content', label: 'Content', icon: FaFileCode },
    { id: 'purpose', label: 'Purpose & Use', icon: FaRocket },
    { id: 'quality', label: 'Quality & Curation', icon: FaAward },
    { id: 'benchmarks', label: 'Benchmarks', icon: FaChartLine },
    { id: 'ethics', label: 'Ethics & License', icon: FaGavel },
    { id: 'download', label: 'Download & Access', icon: FaDownload },
    { id: 'related', label: 'Related Links', icon: FaLink },
    { id: 'statistics', label: 'Statistics', icon: FaChartLine },
    { id: 'changelog', label: 'Changelog', icon: FaHistory },
    { id: 'citation', label: 'Citation', icon: FaBook },
    { id: 'community', label: 'Community', icon: FaUsers },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dataset Not Found</h1>
        <p className="text-gray-600">{error || 'The dataset you are looking for does not exist.'}</p>
      </div>
    );
  }

  // Prepare chart data
  const languageData = dataset.languages && dataset.languages.length > 0
    ? dataset.languages.map(lang => ({ name: lang, value: 1 }))
    : [{ name: dataset.language || 'Unknown', value: 1 }];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <>
      {dataset && generateSchema() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema(), null, 2) }}
        />
      )}
      <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 flex-wrap">
              {dataset.logo_url ? (
                <img src={dataset.logo_url} alt={dataset.name} className="w-20 h-20 rounded-lg" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                  <FaDatabase className="w-10 h-10" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{dataset.name}</h1>
                {dataset.provider && (
                  <p className="text-lg text-red-100 mb-3">Developed by {dataset.provider}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{typeof dataset.rating === 'number' && !isNaN(dataset.rating) ? dataset.rating.toFixed(1) : 'N/A'}</span>
                    <span className="text-red-100">({dataset.rating_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaDownload className="text-red-200" />
                    <span>{dataset.download_count || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEye className="text-red-200" />
                    <span>{dataset.view_count || 0} views</span>
                  </div>
                  {dataset.version && (
                    <div className="flex items-center gap-1">
                      <FaCode className="text-red-200" />
                      <span>v{dataset.version}</span>
                    </div>
                  )}
                  {dataset.license && (
                    <div className="flex items-center gap-1">
                      <FaGavel className="text-red-200" />
                      <span>{dataset.license}</span>
                    </div>
                  )}
                  {dataset.dataset_type && (
                    <div className="flex items-center gap-1">
                      <FaTag className="text-red-200" />
                      <span>{dataset.dataset_type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab - Section 1: Basic Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaDatabase className="text-red-600" />
                  Basic Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dataset Name</p>
                    <p className="font-semibold text-lg">{dataset.name}</p>
                  </div>
                  {dataset.version && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Version</p>
                      <p className="font-semibold">{dataset.version}</p>
                    </div>
                  )}
                  {dataset.release_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Release Date</p>
                      <p className="font-semibold">{new Date(dataset.release_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {dataset.provider && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Developed By</p>
                      <p className="font-semibold">{dataset.provider}</p>
                    </div>
                  )}
                  {dataset.license && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">License Type</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        dataset.license.toLowerCase().includes('mit') || dataset.license.toLowerCase().includes('apache') || dataset.license.toLowerCase().includes('cc')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dataset.license}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Accessibility</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <FaUnlock className="mr-1" />
                      Open Access
                    </span>
                  </div>
                  {dataset.dataset_type && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Dataset Type</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {dataset.dataset_type}
                      </span>
                    </div>
                  )}
                </div>

                {/* Official Links */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Official Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {dataset.github_url && (
                      <a href={dataset.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {dataset.huggingface_url && (
                      <a href={dataset.huggingface_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <FaDatabase /> HuggingFace
                      </a>
                    )}
                    {dataset.kaggle_url && (
                      <a href={dataset.kaggle_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <FaDatabase /> Kaggle
                      </a>
                    )}
                    {dataset.paper_url && (
                      <a href={dataset.paper_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <FaBook /> Paper
                      </a>
                    )}
                    {dataset.documentation_url && (
                      <a href={dataset.documentation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <FaFileAlt /> Documentation
                      </a>
                    )}
                  </div>
                </div>

                {/* Intended Use Tags */}
                {dataset.task_types && dataset.task_types.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Intended Use</h3>
                    <div className="flex flex-wrap gap-2">
                      {dataset.task_types.map((task, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Description */}
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {dataset.full_description || dataset.description || 'No description available.'}
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Technical Specifications Tab - Section 2 */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaCog className="text-red-600" />
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dataset.size && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Dataset Size</p>
                      <p className="font-semibold text-lg">{dataset.size}</p>
                    </div>
                  )}
                  {dataset.rows && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Number of Samples</p>
                      <p className="font-semibold text-lg">{dataset.rows.toLocaleString()} records</p>
                    </div>
                  )}
                  {dataset.columns && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Columns/Features</p>
                      <p className="font-semibold">{dataset.columns}</p>
                    </div>
                  )}
                  {dataset.languages && dataset.languages.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Languages Covered</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dataset.languages.map((lang, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            <FaLanguage className="mr-1" />
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {dataset.language && !dataset.languages && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Language</p>
                      <p className="font-semibold">{dataset.language}</p>
                    </div>
                  )}
                  {dataset.format && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Data Format</p>
                      <p className="font-semibold">{dataset.format}</p>
                    </div>
                  )}
                  {dataset.preprocessing_info && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Preprocessing</p>
                      <p className="text-gray-700">{dataset.preprocessing_info}</p>
                    </div>
                  )}
                </div>

                {/* Features/Schema */}
                {dataset.features && dataset.features.length > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-3">Dataset Features</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {dataset.features.map((feature, idx) => (
                          <li key={idx} className="text-gray-700">{typeof feature === 'string' ? feature : JSON.stringify(feature)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Content Tab - Section 3 */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaFileCode className="text-red-600" />
                  Content Description
                </h2>
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {dataset.full_description || dataset.description || 'No content description available.'}
                  </p>
                </div>

                {/* Data Sources */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Data Sources</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dataset.domain && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FaDatabase className="text-gray-600" />
                        <span>{dataset.domain}</span>
                      </div>
                    )}
                    {dataset.collection_method && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FaTools className="text-gray-600" />
                        <span>Collection: {dataset.collection_method}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Example Snippet */}
                {dataset.sample_data && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-3">Example Sample</h3>
                    <div className="rounded-lg overflow-hidden">
                      <SyntaxHighlighter language="json" style={oneDark}>
                        {JSON.stringify(dataset.sample_data, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}

                {/* Modality */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="font-semibold mb-3">Modality</h3>
                  <div className="flex flex-wrap gap-2">
                    {dataset.dataset_type && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        {dataset.dataset_type}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Purpose & Applications Tab - Section 4 */}
          {activeTab === 'purpose' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaRocket className="text-red-600" />
                  Purpose & Applications
                </h2>

                {/* Supported Tasks */}
                {dataset.task_types && dataset.task_types.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Supported Tasks</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dataset.task_types.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <FaCheckCircle className="text-green-600" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Models Trained On This Dataset */}
                {dataset.models_trained_on_it && dataset.models_trained_on_it.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Models Trained On This Dataset</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dataset.models_trained_on_it.map((model) => (
                        <Link
                          key={model.id}
                          href={`/models/${model.slug}`}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                        >
                          {model.logo_url ? (
                            <img src={model.logo_url} alt={model.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <FaBrain className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{model.name}</p>
                            {model.developer && (
                              <p className="text-sm text-gray-600">{model.developer}</p>
                            )}
                            {model.parameters && (
                              <p className="text-xs text-gray-500">{model.parameters}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Industry Use Cases */}
                {dataset.domain && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-3">Industry Use Cases</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-gray-700">Ideal for: <strong>{dataset.domain}</strong> applications</p>
                      {dataset.task_types && dataset.task_types.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Particularly suited for: {dataset.task_types.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Quality & Curation Tab - Section 5 */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaAward className="text-red-600" />
                  Quality & Curation
                </h2>
                <div className="space-y-6">
                  {dataset.quality_score && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quality Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-red-600 h-3 rounded-full"
                            style={{ width: `${(dataset.quality_score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{dataset.quality_score}/5.0</span>
                      </div>
                    </div>
                  )}
                  {dataset.preprocessing_info && (
                    <div>
                      <h3 className="font-semibold mb-2">Data Cleaning & Filtering</h3>
                      <p className="text-gray-700">{dataset.preprocessing_info}</p>
                    </div>
                  )}
                  {dataset.collection_method && (
                    <div>
                      <h3 className="font-semibold mb-2">Collection Method</h3>
                      <p className="text-gray-700">{dataset.collection_method}</p>
                    </div>
                  )}
                  {dataset.ethical_considerations && (
                    <div>
                      <h3 className="font-semibold mb-2">Ethical Considerations</h3>
                      <p className="text-gray-700">{dataset.ethical_considerations}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Benchmarks Tab - Section 6 */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-red-600" />
                  Benchmark & Evaluation Use
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This dataset is used in various benchmarks and evaluation tasks. Check the paper or documentation for specific benchmark results.
                  </p>
                  {dataset.paper_url && (
                    <a href={dataset.paper_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                      <FaBook /> View Research Paper
                    </a>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Ethics, License & Legal Tab - Section 7 */}
          {activeTab === 'ethics' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaGavel className="text-red-600" />
                  Ethics, License & Legal Use
                </h2>
                <div className="space-y-6">
                  {dataset.license && (
                    <div>
                      <h3 className="font-semibold mb-2">License</h3>
                      <p className="text-gray-700 mb-2">{dataset.license}</p>
                      <div className="flex items-center gap-2">
                        {(dataset.license.toLowerCase().includes('mit') || 
                          dataset.license.toLowerCase().includes('apache') || 
                          dataset.license.toLowerCase().includes('cc-by')) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" /> Commercial Use Allowed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {dataset.ethical_considerations && (
                    <div>
                      <h3 className="font-semibold mb-2">Ethical Considerations</h3>
                      <p className="text-gray-700">{dataset.ethical_considerations}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Compliance</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                        Check documentation for specific compliance requirements
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Responsible Use Recommendations</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-700">
                        Please review the license and ethical considerations before using this dataset. Ensure compliance with applicable data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Download & Access Tab - Section 8 */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaDownload className="text-red-600" />
                  Download & Access
                </h2>
                <div className="space-y-6">
                  {/* Direct Download Links */}
                  <div>
                    <h3 className="font-semibold mb-3">Direct Download</h3>
                    <div className="flex flex-wrap gap-3">
                      {dataset.huggingface_url && (
                        <a
                          href={dataset.huggingface_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          <FaDatabase /> Download from HuggingFace
                        </a>
                      )}
                      {dataset.download_url && (
                        <a
                          href={dataset.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          <FaDownload /> Direct Download
                        </a>
                      )}
                      {dataset.kaggle_url && (
                        <a
                          href={dataset.kaggle_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          <FaDatabase /> Kaggle
                        </a>
                      )}
                    </div>
                  </div>

                  {/* HuggingFace CLI Command */}
                  {dataset.huggingface_url && (
                    <div>
                      <h3 className="font-semibold mb-3">HuggingFace CLI</h3>
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <CopyToClipboard
                          text={`huggingface-cli download ${dataset.huggingface_url.split('/').pop()}`}
                          onCopy={() => handleCopy('hf-cli')}
                        >
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-white">
                            {copiedId === 'hf-cli' ? <FaCheckCircle /> : <FaCopy />}
                          </button>
                        </CopyToClipboard>
                        <code className="text-green-400">
                          huggingface-cli download {dataset.huggingface_url.split('/').pop()}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Python Loading Code */}
                  <div>
                    <h3 className="font-semibold mb-3">Python Example</h3>
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <CopyToClipboard
                        text={`from datasets import load_dataset\n\ndataset = load_dataset("${dataset.huggingface_url?.split('/').pop() || 'dataset-name'}", split="train")`}
                        onCopy={() => handleCopy('python')}
                      >
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-white">
                          {copiedId === 'python' ? <FaCheckCircle /> : <FaCopy />}
                        </button>
                      </CopyToClipboard>
                      <SyntaxHighlighter language="python" style={oneDark}>
                        {`from datasets import load_dataset\n\ndataset = load_dataset("${dataset.huggingface_url?.split('/').pop() || 'dataset-name'}", split="train")`}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Related Links Tab - Section 9 */}
          {activeTab === 'related' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaLink className="text-red-600" />
                  Related Links
                </h2>
                
                {/* Models Trained On It */}
                {dataset.models_trained_on_it && dataset.models_trained_on_it.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Models Trained On This Dataset</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dataset.models_trained_on_it.map((model) => (
                        <Link
                          key={model.id}
                          href={`/models/${model.slug}`}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                        >
                          {model.logo_url ? (
                            <img src={model.logo_url} alt={model.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <FaBrain className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{model.name}</p>
                            {model.developer && (
                              <p className="text-sm text-gray-600">{model.developer}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Datasets */}
                {dataset.similar_datasets && dataset.similar_datasets.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3">Similar Datasets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dataset.similar_datasets.map((similar) => (
                        <Link
                          key={similar.id}
                          href={`/datasets/${similar.slug}`}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:border-red-500 hover:shadow-md transition-all"
                        >
                          {similar.logo_url ? (
                            <img src={similar.logo_url} alt={similar.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <FaDatabase className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{similar.name}</p>
                            {similar.dataset_type && (
                              <p className="text-sm text-gray-600">{similar.dataset_type}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Statistics Tab - Section 10 */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-red-600" />
                  Statistics Visualization
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Language Breakdown */}
                  {languageData.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Language Breakdown</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={languageData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {languageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Dataset Size Distribution */}
                  {dataset.rows && (
                    <div>
                      <h3 className="font-semibold mb-3">Dataset Size</h3>
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                          {dataset.rows.toLocaleString()}
                        </div>
                        <div className="text-gray-600">Total Records</div>
                        {dataset.size && (
                          <div className="text-sm text-gray-500 mt-2">Size: {dataset.size}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Changelog Tab - Section 11 */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaHistory className="text-red-600" />
                  Changelog & Version History
                </h2>
                <div className="space-y-4">
                  {dataset.version && (
                    <div className="border-l-4 border-red-600 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Version {dataset.version}</span>
                        {dataset.release_date && (
                          <span className="text-sm text-gray-600">
                            ({new Date(dataset.release_date).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      {dataset.last_updated && (
                        <p className="text-sm text-gray-600">Last updated: {new Date(dataset.last_updated).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                  {!dataset.version && (
                    <p className="text-gray-600">No version history available.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Citation Tab - Section 12 */}
          {activeTab === 'citation' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaBook className="text-red-600" />
                  Citation & Reference
                </h2>
                <div className="space-y-6">
                  {dataset.citation ? (
                    <div>
                      <h3 className="font-semibold mb-3">BibTeX</h3>
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <CopyToClipboard
                          text={dataset.citation}
                          onCopy={() => handleCopy('bibtex')}
                        >
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-white">
                            {copiedId === 'bibtex' ? <FaCheckCircle /> : <FaCopy />}
                          </button>
                        </CopyToClipboard>
                        <SyntaxHighlighter language="bibtex" style={oneDark}>
                          {dataset.citation}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-700">No citation information available. Please check the dataset documentation or paper.</p>
                      {dataset.paper_url && (
                        <a href={dataset.paper_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2">
                          <FaBook /> View Paper for Citation
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Community Tab - Section 13 */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaUsers className="text-red-600" />
                  Community & Contribution
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Community Links</h3>
                      <div className="space-y-2">
                        {dataset.github_url && (
                          <a href={dataset.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                            <FaGithub /> GitHub Repository
                          </a>
                        )}
                        {dataset.huggingface_url && (
                          <a href={dataset.huggingface_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                            <FaDatabase /> HuggingFace Discussions
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Maintainers</h3>
                      {dataset.provider ? (
                        <p className="text-gray-700">{dataset.provider}</p>
                      ) : (
                        <p className="text-gray-600">Information not available</p>
                      )}
                    </div>
                  </div>
                  {dataset.last_updated && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">
                        Last updated: <strong>{new Date(dataset.last_updated).toLocaleDateString()}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
