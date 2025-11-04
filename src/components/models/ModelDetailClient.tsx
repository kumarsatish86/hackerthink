'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FormattedContent from '@/components/FormattedContent';
import { 
  FaBrain, FaDownload, FaStar, FaCode, FaBook, FaRocket, FaChartLine, FaUsers,
  FaCalendar, FaGavel, FaShieldAlt, FaGraduationCap, FaDatabase, FaCog,
  FaFileCode, FaCopy, FaCheckCircle, FaExclamationTriangle, FaLink,
  FaGitAlt, FaGithub, FaLanguage, FaEye, FaTools, FaHistory, FaProjectDiagram
} from 'react-icons/fa';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  description?: string;
  full_description?: string;
  model_type?: string;
  architecture?: string;
  parameters?: string;
  context_length?: number;
  version?: string;
  license?: string;
  pricing_type?: string;
  capabilities?: string[];
  languages?: string[];
  use_cases?: string[];
  api_endpoint?: string;
  documentation_url?: string;
  demo_url?: string;
  github_url?: string;
  paper_url?: string;
  huggingface_url?: string;
  logo_url?: string;
  rating: number;
  rating_count: number;
  view_count: number;
  download_count: number;
  release_date?: string;
  release_date_full?: string;
  
  // Technical specifications
  tokenizer?: string;
  vocabulary_size?: number;
  training_framework?: string;
  quantized_versions?: string[];
  hardware_requirements?: string;
  inference_speed?: string;
  memory_footprint?: string;
  
  // Additional HF fields
  safetensors?: {
    model_size?: string;
    tensor_type?: string;
    files?: any[];
  };
  model_tree?: {
    finetunes?: number;
    merges?: number;
    quantizations?: number;
  };
  spaces_using?: Array<{ name: string; url: string }>;
  links?: {
    homepage?: string;
    api?: string;
    github?: string;
    modelscope?: string;
    contact?: string;
  };
  coding_benchmarks?: any;
  intelligence_benchmarks?: any;
  benchmarks?: any;
  benchmarks_list?: any[];
  
  // Training data
  training_data_sources?: Array<{
    name: string;
    dataset_type?: string;
    token_count?: number;
    percentage?: number;
    source?: string;
    url?: string;
  }>;
  
  // Variants
  variants?: Array<{
    variant_model_id: string;
    relationship_type: string;
    variant_name: string;
    variant_slug: string;
  }>;
  parent_models?: Array<{
    parent_model_id: string;
    relationship_type: string;
    parent_name: string;
    parent_slug: string;
  }>;
  
  // Usage examples
  usage_examples?: Array<{
    example_type: string;
    code: string;
    language?: string;
    description?: string;
    title?: string;
  }>;
  
  // Changelog
  changelog_list?: Array<{
    version: string;
    release_date?: string;
    changes?: any;
    description?: string;
    performance_improvements?: string;
    bug_fixes?: string;
    new_features?: string;
  }>;
  
  // Community
  community_links_list?: Array<{
    link_type: string;
    url: string;
    title?: string;
    description?: string;
  }>;
  community_stats?: {
    downloads?: number;
    likes?: number;
    tags?: string[];
  };
  github_stats?: {
    stars?: number;
    forks?: number;
    issues?: number;
    language?: string;
  };
  
  // Evaluation & Safety
  evaluation_summary?: string;
  known_biases?: any[];
  safety_results?: any;
  ethical_risks?: any;
  
  // Model relationships
  model_family?: string;
  architecture_family?: string;
}

export default function ModelDetailClient({ slug }: { slug: string }) {
  const [model, setModel] = useState<AIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/models/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setModel(data.model);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching model:', err);
        setError('Failed to load model');
        setLoading(false);
      });
  }, [slug]);

  const copyToClipboard = (code: string, exampleId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(exampleId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Model Not Found</h1>
        <p className="text-gray-600">{error || 'The model you are looking for does not exist.'}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaBrain },
    { id: 'technical', label: 'Technical Specs', icon: FaCog },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'capabilities', label: 'Capabilities', icon: FaEye },
    { id: 'training', label: 'Training Data', icon: FaDatabase },
    { id: 'usage', label: 'Usage Examples', icon: FaFileCode },
    { id: 'licensing', label: 'Licensing & Ethics', icon: FaGavel },
    { id: 'community', label: 'Community', icon: FaUsers },
    { id: 'variants', label: 'Variants', icon: FaProjectDiagram },
    { id: 'changelog', label: 'Changelog', icon: FaHistory },
    { id: 'comparison', label: 'Comparison', icon: FaChartLine },
  ];

  // Generate JSON-LD schema
  const generateSchema = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': model.name,
      'applicationCategory': 'AI Model',
      'operatingSystem': 'Cross-platform',
      'description': model.description || '',
      'url': `${baseUrl}/models/${model.slug}`,
      ...(model.version && { 'softwareVersion': model.version }),
      ...(model.developer && { 
        'author': {
          '@type': 'Organization',
          'name': model.developer
        }
      }),
      ...(model.release_date_full && {
        'datePublished': new Date(model.release_date_full).toISOString(),
      }),
      ...(model.license && {
        'license': model.license
      }),
      'offers': {
        '@type': 'Offer',
        'price': model.pricing_type === 'free' ? '0' : 'varies',
        'priceCurrency': 'USD'
      },
      ...(model.huggingface_url && {
        'downloadUrl': model.huggingface_url
      }),
      ...(model.github_url && {
        'codeRepository': model.github_url
      }),
      'applicationSubCategory': model.model_type || 'General AI',
      ...(model.architecture && {
        'programmingModel': model.architecture
      })
    };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema(), null, 2) }}
      />
      <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 flex-wrap">
            {model.logo_url ? (
              <img src={model.logo_url} alt={model.name} className="w-20 h-20 rounded-lg" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                <FaBrain className="w-10 h-10" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{model.name}</h1>
              {model.developer && (
                <p className="text-lg text-red-100 mb-3">{model.developer}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{typeof model.rating === 'number' && !isNaN(model.rating) ? model.rating.toFixed(1) : 'N/A'}</span>
                  <span className="text-red-100">({model.rating_count || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaDownload className="text-red-200" />
                  <span>{model.download_count || 0} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaEye className="text-red-200" />
                  <span>{model.view_count || 0} views</span>
                </div>
                {model.version && (
                  <div className="flex items-center gap-1">
                    <FaCode className="text-red-200" />
                    <span>v{model.version}</span>
                  </div>
                )}
                {model.license && (
                  <div className="flex items-center gap-1">
                    <FaGavel className="text-red-200" />
                    <span>{model.license}</span>
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Overview Section */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaBrain className="text-red-600" />
                Basic Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model Name</p>
                  <p className="font-semibold text-lg">{model.name}</p>
                </div>
                {model.version && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Version</p>
                    <p className="font-semibold">{model.version}</p>
                  </div>
                )}
                {model.release_date_full && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Release Date</p>
                    <p className="font-semibold">
                      {new Date(model.release_date_full).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {model.developer && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Developer / Organization</p>
                    <p className="font-semibold">{model.developer}</p>
                  </div>
                )}
                {model.license && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">License Type</p>
                    <p className="font-semibold">{model.license}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Availability</p>
                  <p className="font-semibold">
                    {model.pricing_type === 'free' ? 'Open-source' : 
                     model.pricing_type === 'paid' ? 'API-only / Paid' : 
                     'Open-source / API available'}
                  </p>
                </div>
              </div>

              {/* Official Links */}
              {(model.github_url || model.huggingface_url || model.paper_url || model.links?.homepage) && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Official Links</p>
                  <div className="flex flex-wrap gap-3">
                    {model.links?.homepage && (
                      <a href={model.links.homepage} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        <FaRocket /> Homepage
                      </a>
                    )}
                    {model.github_url && (
                      <a href={model.github_url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {model.huggingface_url && (
                      <a href={model.huggingface_url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                        <FaBrain /> HuggingFace
                      </a>
                    )}
                    {model.paper_url && (
                      <a href={model.paper_url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <FaBook /> Research Paper
                      </a>
                    )}
                    {model.links?.api && (
                      <a href={model.links.api} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        <FaCode /> API Platform
                      </a>
                    )}
                    {model.links?.modelscope && (
                      <a href={model.links.modelscope} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <FaDownload /> ModelScope
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Full Description */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              {model.full_description ? (
                <FormattedContent content={model.full_description} />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {model.description || 'No description available.'}
                </p>
              )}
            </section>
          </div>
        )}

        {/* Technical Specifications Tab */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaCog className="text-red-600" />
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {model.architecture && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Architecture / Family</p>
                    <p className="font-semibold">{model.architecture}</p>
                  </div>
                )}
                {model.model_family && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model Family</p>
                    <p className="font-semibold">{model.model_family}</p>
                  </div>
                )}
                {model.architecture_family && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Architecture Family</p>
                    <p className="font-semibold">{model.architecture_family}</p>
                  </div>
                )}
                {model.parameters && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Parameter Count</p>
                    <p className="font-semibold">{model.parameters}</p>
                  </div>
                )}
                {model.context_length && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Context Length</p>
                    <p className="font-semibold">{model.context_length.toLocaleString()} tokens</p>
                  </div>
                )}
                {model.tokenizer && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tokenizer</p>
                    <p className="font-semibold">{model.tokenizer}</p>
                  </div>
                )}
                {model.vocabulary_size && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vocabulary Size</p>
                    <p className="font-semibold">{model.vocabulary_size.toLocaleString()}</p>
                  </div>
                )}
                {model.training_framework && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Training Framework</p>
                    <p className="font-semibold">{model.training_framework}</p>
                  </div>
                )}
                {model.quantized_versions && model.quantized_versions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantized Versions</p>
                    <div className="flex flex-wrap gap-2">
                      {model.quantized_versions.map((q, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {model.hardware_requirements && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Hardware Requirements</p>
                    <p className="font-semibold">{model.hardware_requirements}</p>
                  </div>
                )}
                {model.inference_speed && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Inference Speed</p>
                    <p className="font-semibold">{model.inference_speed}</p>
                  </div>
                )}
                {model.memory_footprint && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Memory Footprint</p>
                    <p className="font-semibold">{model.memory_footprint}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Safetensors Info */}
            {model.safetensors && (
              <section className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Safetensors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {model.safetensors.model_size && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Model Size</p>
                      <p className="font-semibold">{model.safetensors.model_size}</p>
                    </div>
                  )}
                  {model.safetensors.tensor_type && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tensor Type</p>
                      <p className="font-semibold">{model.safetensors.tensor_type}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Performance & Benchmarks Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {model.evaluation_summary && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Evaluation Summary</h2>
                <p className="text-gray-700 leading-relaxed">{model.evaluation_summary}</p>
              </section>
            )}

            {/* Benchmarks from database table */}
            {model.benchmarks_list && model.benchmarks_list.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Benchmarks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Benchmark</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Score</th>
                        <th className="text-left p-2">Metric Type</th>
                        {model.benchmarks_list.some((b: any) => b.dataset_name) && (
                          <th className="text-left p-2">Dataset</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {model.benchmarks_list.map((benchmark: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-medium">{benchmark.benchmark_name}</td>
                          <td className="p-2">{benchmark.category || '—'}</td>
                          <td className="p-2 font-semibold">{benchmark.score || '—'}</td>
                          <td className="p-2">{benchmark.metric_type || '—'}</td>
                          {model.benchmarks_list?.some((b: any) => b.dataset_name) && (
                            <td className="p-2">{benchmark.dataset_name || '—'}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Coding Benchmarks */}
            {model.coding_benchmarks && Object.keys(model.coding_benchmarks).length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Coding & Agentic Benchmarks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Benchmark</th>
                        <th className="text-left p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(model.coding_benchmarks).map(([benchmark, score]: [string, any]) => (
                        <tr key={benchmark} className="border-b">
                          <td className="p-2 font-medium">{benchmark.replace(/_/g, ' ')}</td>
                          <td className="p-2 font-semibold">{score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Intelligence Benchmarks */}
            {model.intelligence_benchmarks && Object.keys(model.intelligence_benchmarks).length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Intelligence Benchmarks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Benchmark</th>
                        <th className="text-left p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(model.intelligence_benchmarks).map(([benchmark, score]: [string, any]) => (
                        <tr key={benchmark} className="border-b">
                          <td className="p-2 font-medium">{benchmark.replace(/_/g, ' ')}</td>
                          <td className="p-2 font-semibold">{score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Capabilities / Use Cases Tab */}
        {activeTab === 'capabilities' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaEye className="text-red-600" />
                Capabilities & Use Cases
              </h2>
              
              {model.capabilities && model.capabilities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.capabilities.map((cap, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {model.use_cases && model.use_cases.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {model.use_cases.map((useCase, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {model.languages && model.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Supported Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <FaLanguage className="inline mr-1" />
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaDatabase className="text-red-600" />
                Datasets & Training Information
              </h2>
              
              {model.training_data_sources && model.training_data_sources.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Dataset Name</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Token Count</th>
                        <th className="text-left p-2">Percentage</th>
                        {model.training_data_sources.some((ds: any) => ds.url) && (
                          <th className="text-left p-2">Source</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {model.training_data_sources.map((source: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-medium">{source.name || source.dataset_name}</td>
                          <td className="p-2">{source.dataset_type || source.type || '—'}</td>
                          <td className="p-2">
                            {source.token_count 
                              ? typeof source.token_count === 'number' 
                                ? source.token_count.toLocaleString()
                                : source.token_count
                              : '—'}
                          </td>
                          <td className="p-2">
                            {source.percentage ? `${source.percentage}%` : '—'}
                          </td>
                          {model.training_data_sources?.some((ds: any) => ds.url) && (
                            <td className="p-2">
                              {source.url ? (
                                <a href={source.url} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:text-blue-800">
                                  Link
                                </a>
                              ) : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">Training data information not available.</p>
              )}
            </section>
          </div>
        )}

        {/* Usage Examples Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaFileCode className="text-red-600" />
                Usage Examples
              </h2>
              
              {model.usage_examples && model.usage_examples.length > 0 ? (
                <div className="space-y-6">
                  {model.usage_examples.map((example: any, idx: number) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{example.title || example.example_type || 'Example'}</span>
                          {example.language && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                              {example.language}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(example.code, `example-${idx}`)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedCode === `example-${idx}` ? (
                            <FaCheckCircle className="text-green-600" />
                          ) : (
                            <FaCopy className="text-gray-600" />
                          )}
                        </button>
                      </div>
                      {example.description && (
                        <div className="px-4 py-2 bg-blue-50 border-b text-sm text-gray-700">
                          {example.description}
                        </div>
                      )}
                      <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap">{example.code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Default deployment examples */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Python (Transformers)</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">Python</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`from transformers import AutoModelForCausalLM, AutoTokenizer\n\ntokenizer = AutoTokenizer.from_pretrained("${model.slug}")\nmodel = AutoModelForCausalLM.from_pretrained("${model.slug}")`, 'default-python')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedCode === 'default-python' ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <FaCopy className="text-gray-600" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                      <pre className="text-sm font-mono">{`from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("${model.slug}")
model = AutoModelForCausalLM.from_pretrained("${model.slug}")`}</pre>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Licensing & Ethics Tab */}
        {activeTab === 'licensing' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaGavel className="text-red-600" />
                Licensing, Legal & Ethics
              </h2>
              
              <div className="space-y-6">
                {model.license && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">License</h3>
                    <p className="text-gray-700">
                      <span className="font-medium">{model.license}</span>
                    </p>
                    {model.pricing_type === 'free' && (
                      <p className="text-sm text-green-600 mt-1">✓ Commercial use allowed</p>
                    )}
                  </div>
                )}

                {model.known_biases && model.known_biases.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaExclamationTriangle className="text-yellow-600" />
                      Known Biases
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {model.known_biases.map((bias: any, idx: number) => (
                        <li key={idx}>{typeof bias === 'string' ? bias : JSON.stringify(bias)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {model.safety_results && Object.keys(model.safety_results).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaShieldAlt className="text-blue-600" />
                      Safety Results
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(model.safety_results, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {model.ethical_risks && Object.keys(model.ethical_risks).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-600" />
                      Ethical Risks
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(model.ethical_risks, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Community & Ecosystem Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            {/* GitHub Stats */}
            {model.github_stats && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaGithub className="text-red-600" />
                  GitHub Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.github_stats.stars || 0}</p>
                    <p className="text-sm text-gray-600">Stars</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.github_stats.forks || 0}</p>
                    <p className="text-sm text-gray-600">Forks</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.github_stats.issues || 0}</p>
                    <p className="text-sm text-gray-600">Issues</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.github_stats.language || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Language</p>
                  </div>
                </div>
              </section>
            )}

            {/* HuggingFace Community */}
            {model.community_stats && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">HuggingFace Community</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.community_stats.downloads || 0}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{model.community_stats.likes || 0}</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                </div>
              </section>
            )}

            {/* Community Links */}
            {model.community_links_list && model.community_links_list.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Community Links</h2>
                <div className="space-y-2">
                  {model.community_links_list.map((link: any, idx: number) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <FaLink className="text-blue-600" />
                      <div>
                        <p className="font-medium">{link.title || link.link_type}</p>
                        {link.description && (
                          <p className="text-sm text-gray-600">{link.description}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Spaces Using */}
            {model.spaces_using && model.spaces_using.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">
                  Spaces Using This Model ({model.spaces_using.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {model.spaces_using.slice(0, 20).map((space, idx) => (
                    <a key={idx} href={space.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      <FaRocket className="text-blue-600" />
                      {space.name}
                    </a>
                  ))}
                  {model.spaces_using.length > 20 && (
                    <div className="col-span-full text-center text-sm text-gray-500 py-2">
                      + {model.spaces_using.length - 20} more spaces
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            {model.parent_models && model.parent_models.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Parent Models</h2>
                <div className="space-y-3">
                  {model.parent_models.map((parent: any, idx: number) => (
                    <Link key={idx} href={`/models/${parent.parent_slug}`}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <FaProjectDiagram className="text-blue-600" />
                      <div>
                        <p className="font-semibold">{parent.parent_name}</p>
                        <p className="text-sm text-gray-600">
                          Relationship: {parent.relationship_type || 'variant'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {model.variants && model.variants.length > 0 ? (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Related Models / Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {model.variants.map((variant: any, idx: number) => (
                    <Link key={idx} href={`/models/${variant.variant_slug}`}
                          className="p-4 border rounded-lg hover:border-red-500 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-lg">{variant.variant_name}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {variant.relationship_type || 'variant'}
                        </span>
                      </div>
                      {variant.description && (
                        <p className="text-sm text-gray-600 mt-2">{variant.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No variants or related models found.</p>
              </section>
            )}
          </div>
        )}

        {/* Changelog Tab */}
        {activeTab === 'changelog' && (
          <div className="space-y-6">
            {model.changelog_list && model.changelog_list.length > 0 ? (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FaHistory className="text-red-600" />
                  Changelog & Update History
                </h2>
                <div className="space-y-6">
                  {model.changelog_list.map((entry: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Version {entry.version}</h3>
                        {entry.release_date && (
                          <span className="text-sm text-gray-600">
                            {new Date(entry.release_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      {entry.description && (
                        <p className="text-gray-700 mb-2">{entry.description}</p>
                      )}
                      {entry.changes && (
                        <div className="mt-3 space-y-2">
                          {entry.new_features && (
                            <div>
                              <p className="text-sm font-semibold text-green-700 mb-1">New Features:</p>
                              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {Array.isArray(entry.new_features) ? (
                                  entry.new_features.map((feat: string, i: number) => (
                                    <li key={i}>{feat}</li>
                                  ))
                                ) : (
                                  <li>{entry.new_features}</li>
                                )}
                              </ul>
                            </div>
                          )}
                          {entry.bug_fixes && (
                            <div>
                              <p className="text-sm font-semibold text-blue-700 mb-1">Bug Fixes:</p>
                              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {Array.isArray(entry.bug_fixes) ? (
                                  entry.bug_fixes.map((fix: string, i: number) => (
                                    <li key={i}>{fix}</li>
                                  ))
                                ) : (
                                  <li>{entry.bug_fixes}</li>
                                )}
                              </ul>
                            </div>
                          )}
                          {entry.performance_improvements && (
                            <div>
                              <p className="text-sm font-semibold text-purple-700 mb-1">Performance Improvements:</p>
                              <p className="text-sm text-gray-700">{entry.performance_improvements}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Changelog not available.</p>
              </section>
            )}
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Compare with Other Models</h2>
              <p className="text-gray-600 mb-4">
                Compare this model with others to find the best fit for your needs.
              </p>
              <Link href={`/models/compare?models=${model.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaChartLine />
                Start Comparison
              </Link>
            </section>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
