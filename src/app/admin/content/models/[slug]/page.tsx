'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBrain, FaSave, FaArrowLeft, FaCog, FaChartLine, FaDatabase,
  FaProjectDiagram, FaHistory, FaFileCode, FaGlobe, FaInfoCircle,
  FaExclamationTriangle, FaCheckCircle, FaPlus, FaTrash, FaEye,
  FaRobot, FaMagic, FaSpinner, FaDownload, FaQuestionCircle, FaFileAlt, FaLock, FaExternalLinkAlt,
} from 'react-icons/fa';
import RelationsManager from '@/components/admin/models/RelationsManager';

type JsonRecord = Record<string, any>;

function parseJsonObject(value: unknown): JsonRecord {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as JsonRecord;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

export default function EditModelPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [modelId, setModelId] = useState<string>('');
  const [overrideFields, setOverrideFields] = useState<Set<string>>(new Set());
  const [arrayInputValues, setArrayInputValues] = useState<Record<string, string>>({});
  const [aiSummary, setAiSummary] = useState<JsonRecord>({});
  const [overviewGuidance, setOverviewGuidance] = useState<JsonRecord>({});
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    slug: '',
    developer: '',
    description: '',
    full_description: '',
    model_type: '',
    status: 'draft',
    featured: false,
    
    // Technical Specifications
    architecture: '',
    parameters: '',
    context_length: '',
    tokenizer: '',
    vocabulary_size: '',
    training_framework: '',
    quantized_versions: [] as string[],
    version: '',
    
    // Links & URLs
    homepage_url: '',
    api_platform_url: '',
    modelscope_url: '',
    github_url: '',
    huggingface_url: '',
    paper_url: '',
    demo_url: '',
    documentation_url: '',
    logo_url: '',
    
    // Licensing & Pricing
    license: '',
    pricing_type: 'free',
    
    // Hardware & Requirements
    hardware_requirements: '',
    inference_speed: '',
    memory_footprint: '',
    
    // Metadata
    categories: [] as string[],
    tags: [] as string[],
    capabilities: [] as string[],
    use_cases: [] as string[],
    
    // Dates
    release_date: '',
    
    // Related Data (will be managed separately)
    benchmarks: [] as any[],
    variants: [] as any[],
    training_data: [] as any[],
    usage_examples: [] as any[],
    changelog: [] as any[],
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FaBrain },
    { id: 'ai_summary', label: 'AI Summary', icon: FaRobot },
    { id: 'guidance', label: 'Overview Guidance', icon: FaCheckCircle },
    { id: 'install', label: 'Install', icon: FaDownload },
    { id: 'faqs', label: 'FAQs', icon: FaQuestionCircle },
    { id: 'papers', label: 'Papers', icon: FaFileAlt },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'technical', label: 'Technical Specs', icon: FaCog },
    { id: 'links', label: 'Links & URLs', icon: FaGlobe },
    { id: 'metadata', label: 'Metadata', icon: FaInfoCircle },
    { id: 'benchmarks', label: 'Benchmarks', icon: FaChartLine },
    { id: 'variants', label: 'Variants', icon: FaProjectDiagram },
    { id: 'training', label: 'Training Data', icon: FaDatabase },
    { id: 'examples', label: 'Usage Examples', icon: FaFileCode },
    { id: 'changelog', label: 'Changelog', icon: FaHistory },
  ];

  useEffect(() => {
    if (slug) {
      fetchModel();
    }
  }, [slug]);

  const fetchModel = async () => {
    try {
      setFetchError(null);
      const response = await fetch(`/api/admin/models/${slug}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch model');
      }
      const model = data.model;
      if (!model) {
        throw new Error('Model data missing from API response');
      }
      
      setModelId(model.id);
      
      // Parse JSONB fields
      const parseArray = (field: any) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const parseString = (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return String(field);
      };

      setFormData({
        name: model.name || '',
        slug: model.slug || '',
        developer: model.developer || '',
        description: model.description || '',
        full_description: model.full_description || '',
        model_type: model.model_type || '',
        status: model.status || 'draft',
        featured: model.featured || false,
        architecture: model.architecture || '',
        parameters: model.parameters || '',
        context_length: model.context_length || '',
        tokenizer: model.tokenizer || '',
        vocabulary_size: model.vocabulary_size || '',
        training_framework: model.training_framework || '',
        quantized_versions: parseArray(model.quantized_versions),
        version: model.version || '',
        homepage_url: model.homepage_url || '',
        api_platform_url: model.api_platform_url || '',
        modelscope_url: model.modelscope_url || '',
        github_url: model.github_url || '',
        huggingface_url: model.huggingface_url || '',
        paper_url: model.paper_url || '',
        demo_url: model.demo_url || '',
        documentation_url: model.documentation_url || '',
        logo_url: model.logo_url || '',
        license: model.license || '',
        pricing_type: model.pricing_type || 'free',
        hardware_requirements: model.hardware_requirements || '',
        inference_speed: model.inference_speed || '',
        memory_footprint: model.memory_footprint || '',
        categories: parseArray(model.categories),
        tags: parseArray(model.tags),
        capabilities: parseArray(model.capabilities),
        use_cases: parseArray(model.use_cases),
        release_date: model.release_date || model.release_date_full || '',
        benchmarks: [],
        variants: [],
        training_data: [],
        usage_examples: [],
        changelog: [],
      });

      setAiSummary(parseJsonObject(model.ai_summary));
      setOverviewGuidance(parseJsonObject(model.overview_guidance));

      // Check for override flags (if stored in database)
      if (model.override_fields) {
        const overrides = parseArray(model.override_fields);
        setOverrideFields(new Set(overrides));
      }
    } catch (error: any) {
      console.error('Error fetching model:', error);
      setFetchError(error?.message || 'Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/models/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ai_summary: aiSummary,
          overview_guidance: overviewGuidance,
          override_fields: Array.from(overrideFields),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update model');
      }

      alert('Model saved successfully.');
      await fetchModel();
    } catch (error: any) {
      console.error('Error updating model:', error);
      alert(error.message || 'Failed to update model');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Mark field as overridden
    setOverrideFields(prev => new Set(prev).add(name));
  };

  const handleArrayChange = (field: string, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setOverrideFields(prev => new Set(prev).add(field));
  };

  const addArrayItem = (field: string, value: string) => {
    if (!value.trim()) return;
    const current = formData[field as keyof typeof formData] as string[];
    handleArrayChange(field, [...current, value.trim()]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const current = formData[field as keyof typeof formData] as string[];
    handleArrayChange(field, current.filter((_, i) => i !== index));
  };

  const regenerateDocs = async () => {
    if (!confirm('Regenerate AI Summary, Overview Guidance, FAQs, install guides, and usage examples from templates? This overwrites auto-generated overview content.')) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/admin/models/${slug}/regenerate-docs`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to regenerate');
      await fetchModel();
      alert(data.message || 'Documentation regenerated. Review AI Summary and Overview Guidance tabs.');
    } catch (error: any) {
      alert(error.message || 'Failed to regenerate docs');
    } finally {
      setRegenerating(false);
    }
  };

  const addJsonArrayItem = (
    target: 'aiSummary' | 'overviewGuidance',
    field: string,
    value: string,
    inputKey: string
  ) => {
    if (!value.trim()) return;
    const setter = target === 'aiSummary' ? setAiSummary : setOverviewGuidance;
    const source = target === 'aiSummary' ? aiSummary : overviewGuidance;
    const current = parseStringArray(source[field]);
    setter({ ...source, [field]: [...current, value.trim()] });
    setArrayInputValues((prev) => ({ ...prev, [inputKey]: '' }));
    setOverrideFields((prev) => new Set(prev).add(target === 'aiSummary' ? 'ai_summary' : 'overview_guidance'));
  };

  const removeJsonArrayItem = (target: 'aiSummary' | 'overviewGuidance', field: string, index: number) => {
    const setter = target === 'aiSummary' ? setAiSummary : setOverviewGuidance;
    const source = target === 'aiSummary' ? aiSummary : overviewGuidance;
    const current = parseStringArray(source[field]);
    setter({ ...source, [field]: current.filter((_, i) => i !== index) });
    setOverrideFields((prev) => new Set(prev).add(target === 'aiSummary' ? 'ai_summary' : 'overview_guidance'));
  };

  const renderJsonArrayField = (
    target: 'aiSummary' | 'overviewGuidance',
    field: string,
    label: string
  ) => {
    const source = target === 'aiSummary' ? aiSummary : overviewGuidance;
    const items = parseStringArray(source[field]);
    const inputKey = `${target}_${field}`;
    const inputValue = arrayInputValues[inputKey] || '';

    return (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setArrayInputValues((prev) => ({ ...prev, [inputKey]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addJsonArrayItem(target, field, inputValue, inputKey);
              }
            }}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            type="button"
            onClick={() => addJsonArrayItem(target, field, inputValue, inputKey)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
              {item}
              <button type="button" onClick={() => removeJsonArrayItem(target, field, index)} className="text-red-600 hover:text-red-800">
                <FaTrash className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const isOverridden = (field: string) => overrideFields.has(field);

  const renderField = (
    label: string,
    name: string,
    type: 'text' | 'number' | 'textarea' | 'select' | 'url' = 'text',
    options?: string[],
    placeholder?: string,
    required?: boolean
  ) => {
    const value = formData[name as keyof typeof formData];
    const overridden = isOverridden(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {overridden && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1">
              <FaExclamationTriangle className="text-xs" />
              Overridden
            </span>
          )}
        </label>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={String(value || '')}
            onChange={handleChange}
            rows={4}
            placeholder={placeholder}
            required={required}
            className={`w-full border rounded-lg px-4 py-2 ${
              overridden ? 'border-yellow-500 bg-yellow-50' : ''
            }`}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            value={String(value || '')}
            onChange={handleChange}
            required={required}
            className={`w-full border rounded-lg px-4 py-2 ${
              overridden ? 'border-yellow-500 bg-yellow-50' : ''
            }`}
          >
            <option value="">Select {label}</option>
            {options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={String(value || '')}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className={`w-full border rounded-lg px-4 py-2 ${
              overridden ? 'border-yellow-500 bg-yellow-50' : ''
            }`}
          />
        )}
      </div>
    );
  };

  const updateArrayInput = (field: string, value: string) => {
    setArrayInputValues(prev => ({ ...prev, [field]: value }));
  };

  const renderArrayField = (label: string, field: string, placeholder?: string) => {
    const items = (formData[field as keyof typeof formData] as string[]) || [];
    const inputValue = arrayInputValues[field] || '';

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          {label}
          {isOverridden(field) && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1">
              <FaExclamationTriangle className="text-xs" />
              Overridden
            </span>
          )}
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => updateArrayInput(field, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem(field, inputValue);
                  updateArrayInput(field, '');
                }
              }}
              placeholder={placeholder || `Add ${label.toLowerCase()}...`}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              type="button"
              onClick={() => {
                addArrayItem(field, inputValue);
                updateArrayInput(field, '');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash className="text-xs" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Could not load model</h1>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchModel();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const modelTypeOptions = Array.from(
    new Set([
      'LLM',
      'Vision',
      'Audio',
      'Multimodal',
      'NLP',
      'Code',
      'Embeddings',
      'image-text-to-text',
      'text-generation',
      'text-to-image',
      ...(formData.model_type ? [formData.model_type] : []),
    ])
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaBrain className="text-red-600" />
            Edit AI Model
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/content/models/${slug}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
            >
              <FaExternalLinkAlt />
              Full Docs Editor
            </Link>
            <button
              type="button"
              onClick={regenerateDocs}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {regenerating ? <FaSpinner className="animate-spin" /> : <FaMagic />}
              {regenerating ? 'Regenerating...' : 'Regenerate AI Docs'}
            </button>
            <Link
              href={`/models/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Public Page
            </Link>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Public content map:</strong>{' '}
          <button type="button" onClick={() => setActiveTab('ai_summary')} className="font-semibold underline">AI Summary</button>
          {' · '}
          <button type="button" onClick={() => setActiveTab('guidance')} className="font-semibold underline">Overview Guidance</button>
          {' · '}
          <button type="button" onClick={() => setActiveTab('install')} className="font-semibold underline">Install</button>
          {' (Docker, ONNX, pip…) · '}
          <button type="button" onClick={() => setActiveTab('faqs')} className="font-semibold underline">FAQs</button>
          {' · '}
          <button type="button" onClick={() => setActiveTab('examples')} className="font-semibold underline">Usage Examples</button>
          . Short Description is only the markdown blurb — not those Overview cards.
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
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
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('Model Name *', 'name', 'text', undefined, 'e.g., Llama 3.1 70B', true)}
              {renderField('Slug *', 'slug', 'text', undefined, 'e.g., llama-3-70b', true)}
              {renderField('Developer / Organization', 'developer', 'text', undefined, 'e.g., Meta')}
              {renderField('Model Type', 'model_type', 'select', modelTypeOptions)}
              {renderField('Version', 'version', 'text', undefined, 'e.g., 1.0')}
              {renderField('Release Date', 'release_date', 'text', undefined, 'YYYY-MM-DD')}
            </div>
            
            <div>
              {renderField('Short Description', 'description', 'textarea', undefined, 'Brief description...')}
              <p className="mt-1 text-xs text-gray-500">
                Shown as markdown in Overview only if filled. The &quot;What it is&quot; card uses <strong>AI Summary → What it is</strong>, not this field.
              </p>
            </div>
            
            <div>
              {renderField('Full Description (Markdown)', 'full_description', 'textarea', undefined, 'Full markdown description...')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('Status', 'status', 'select', ['draft', 'published', 'archived'])}
              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Featured Model</label>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary — maps to public Overview: What / Who / When / Advantages / Limitations / Ideal use cases */}
        {activeTab === 'ai_summary' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaRobot className="text-red-600" /> AI Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                These fields appear on the public model page under <strong>Overview</strong> — the &quot;What it is&quot;, &quot;Who it&apos;s for&quot;, and list cards.
              </p>
            </div>
            {(['what', 'who', 'when_to_use', 'when_not_to_use'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <textarea
                  value={String(aiSummary[key] || '')}
                  onChange={(e) => {
                    setAiSummary((prev) => ({ ...prev, [key]: e.target.value }));
                    setOverrideFields((prev) => new Set(prev).add('ai_summary'));
                  }}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={String(aiSummary.difficulty || 'beginner')}
                onChange={(e) => {
                  setAiSummary((prev) => ({ ...prev, difficulty: e.target.value }));
                  setOverrideFields((prev) => new Set(prev).add('ai_summary'));
                }}
                className="w-full md:w-64 border rounded-lg px-4 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            {renderJsonArrayField('aiSummary', 'advantages', 'Advantages')}
            {renderJsonArrayField('aiSummary', 'limitations', 'Limitations')}
            {renderJsonArrayField('aiSummary', 'ideal_use_cases', 'Ideal Use Cases')}
          </div>
        )}

        {/* Overview Guidance — Strengths / Weaknesses / Best practices / Common mistakes */}
        {activeTab === 'guidance' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCheckCircle className="text-red-600" /> Overview Guidance
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                These list cards appear below Advantages/Limitations on the public <strong>Overview</strong> section.
              </p>
            </div>
            {renderJsonArrayField('overviewGuidance', 'strengths', 'Strengths')}
            {renderJsonArrayField('overviewGuidance', 'weaknesses', 'Weaknesses')}
            {renderJsonArrayField('overviewGuidance', 'best_practices', 'Best Practices')}
            {renderJsonArrayField('overviewGuidance', 'common_mistakes', 'Common Mistakes')}
            {renderJsonArrayField('overviewGuidance', 'requirements', 'Requirements')}
            {renderJsonArrayField('overviewGuidance', 'dependencies', 'Dependencies')}
            {renderJsonArrayField('overviewGuidance', 'features', 'Features')}
            {renderJsonArrayField('overviewGuidance', 'known_limitations', 'Known Limitations')}
            {(['expected_performance', 'commercial_usage', 'ethical_considerations'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <textarea
                  value={String(overviewGuidance[key] || '')}
                  onChange={(e) => {
                    setOverviewGuidance((prev) => ({ ...prev, [key]: e.target.value }));
                    setOverrideFields((prev) => new Set(prev).add('overview_guidance'));
                  }}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'install' && (
          <div className="p-6">
            <RelationsManager
              slug={slug}
              type="install_guides"
              title="Install Guides"
              description="These power the public Installation section (Docker, ONNX, pip, conda, vLLM, TGI, etc.). Edit title, description, and code for each target."
              fields={[
                { key: 'target', label: 'Target', required: true, placeholder: 'e.g. docker, onnx, pip, vllm' },
                { key: 'title', label: 'Title', placeholder: 'e.g. Run with Docker' },
                { key: 'command', label: 'Command' },
                { key: 'code', label: 'Full Code', type: 'code', span: 2 },
                { key: 'description', label: 'Description', type: 'textarea', span: 2 },
                { key: 'version_label', label: 'Version Label', placeholder: 'e.g. latest, optimum>=1.19' },
                { key: 'sort_order', label: 'Sort Order', type: 'number' },
              ]}
              listColumns={['target', 'title', 'version_label']}
              emptyLabel="No install guides yet. Use Regenerate AI Docs or add one manually."
            />
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="p-6">
            <RelationsManager
              slug={slug}
              type="faqs"
              title="FAQs"
              description="Shown on the public FAQ section."
              fields={[
                { key: 'question', label: 'Question', required: true, span: 2 },
                { key: 'answer', label: 'Answer', type: 'textarea', required: true, span: 2 },
                { key: 'sort_order', label: 'Sort Order', type: 'number' },
              ]}
              listColumns={['question', 'sort_order']}
              emptyLabel="No FAQs yet."
            />
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="p-6">
            <RelationsManager
              slug={slug}
              type="papers"
              title="Research Papers"
              description="Shown on the public Papers section."
              fields={[
                { key: 'title', label: 'Title', required: true, span: 2 },
                { key: 'authors', label: 'Authors' },
                { key: 'conference', label: 'Conference' },
                { key: 'published_at', label: 'Published', type: 'date' },
                { key: 'url', label: 'URL' },
                { key: 'bibtex', label: 'BibTeX', type: 'code', span: 2 },
                { key: 'paper_type', label: 'Type', placeholder: 'original / follow-up' },
              ]}
              listColumns={['title', 'conference', 'paper_type']}
              emptyLabel="No papers yet."
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <RelationsManager
              slug={slug}
              type="security_notes"
              title="Security Notes"
              description="Shown on the public Security section (risks, biases, commercial use, export)."
              fields={[
                { key: 'note_type', label: 'Type', required: true, placeholder: 'risk / bias / license / commercial / export' },
                { key: 'title', label: 'Title' },
                { key: 'severity', label: 'Severity', type: 'select', options: ['info', 'low', 'medium', 'high'] },
                { key: 'body', label: 'Body', type: 'textarea', span: 2 },
              ]}
              listColumns={['note_type', 'title', 'severity']}
              emptyLabel="No security notes yet."
            />
          </div>
        )}

        {/* Technical Specifications Tab */}
        {activeTab === 'technical' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('Architecture', 'architecture', 'text', undefined, 'e.g., Transformer, GPT, BERT')}
              {renderField('Parameters', 'parameters', 'text', undefined, 'e.g., 70B, 7B')}
              {renderField('Context Length', 'context_length', 'number', undefined, 'e.g., 8192')}
              {renderField('Tokenizer', 'tokenizer', 'text', undefined, 'e.g., SentencePiece, GPT-2')}
              {renderField('Vocabulary Size', 'vocabulary_size', 'number', undefined, 'e.g., 32000')}
              {renderField('Training Framework', 'training_framework', 'text', undefined, 'e.g., PyTorch, JAX, TensorFlow')}
              {renderField('Hardware Requirements', 'hardware_requirements', 'text', undefined, 'e.g., 1x 24GB GPU')}
              {renderField('Inference Speed', 'inference_speed', 'text', undefined, 'e.g., 50 tokens/sec')}
              {renderField('Memory Footprint', 'memory_footprint', 'text', undefined, 'e.g., 40GB VRAM')}
            </div>
            
            {renderArrayField('Quantized Versions', 'quantized_versions', 'e.g., GGUF, GPTQ, AWQ')}
          </div>
        )}

        {/* Links & URLs Tab */}
        {activeTab === 'links' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Links & URLs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('Homepage URL', 'homepage_url', 'url', undefined, 'https://...')}
              {renderField('API Platform URL', 'api_platform_url', 'url', undefined, 'https://...')}
              {renderField('ModelScope URL', 'modelscope_url', 'url', undefined, 'https://...')}
              {renderField('GitHub URL', 'github_url', 'url', undefined, 'https://github.com/...')}
              {renderField('HuggingFace URL', 'huggingface_url', 'url', undefined, 'https://huggingface.co/...')}
              {renderField('Research Paper URL', 'paper_url', 'url', undefined, 'https://arxiv.org/...')}
              {renderField('Demo URL', 'demo_url', 'url', undefined, 'https://...')}
              {renderField('Documentation URL', 'documentation_url', 'url', undefined, 'https://...')}
              {renderField('Logo URL', 'logo_url', 'url', undefined, 'https://...')}
            </div>
          </div>
        )}

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('License', 'license', 'text', undefined, 'e.g., Apache 2.0, MIT')}
              {renderField('Pricing Type', 'pricing_type', 'select', ['free', 'paid', 'api_based', 'enterprise'])}
            </div>
            
            <div className="space-y-6">
              {renderArrayField('Categories', 'categories', 'e.g., Text Generation')}
              {renderArrayField('Tags', 'tags', 'e.g., transformer, llm')}
              {renderArrayField('Capabilities', 'capabilities', 'e.g., code generation, reasoning')}
              {renderArrayField('Use Cases', 'use_cases', 'e.g., chatbots, coding assistant')}
            </div>
          </div>
        )}

        {/* Benchmarks Tab */}
        {activeTab === 'benchmarks' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Benchmarks</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Benchmarks are managed through the API. Use <code className="bg-blue-100 px-1 rounded">/api/models/{slug}/benchmarks</code> to add/edit benchmarks.
                </p>
              </div>
            </div>
            <Link
              href={`/models/${slug}#performance`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Benchmarks on Public Page
            </Link>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Model Variants</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Variants are managed through the API. Use <code className="bg-blue-100 px-1 rounded">/api/models/{slug}/variants</code> to add/edit variants.
                </p>
              </div>
            </div>
            <Link
              href={`/models/${slug}#variants`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Variants on Public Page
            </Link>
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'training' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Training Data</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Training data sources are managed through the API. Use <code className="bg-blue-100 px-1 rounded">/api/models/{slug}/training-data</code> to add/edit training data.
                </p>
              </div>
            </div>
            <Link
              href={`/models/${slug}#training`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Training Data on Public Page
            </Link>
          </div>
        )}

        {/* Usage Examples Tab */}
        {activeTab === 'examples' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Usage Examples</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Usage examples are managed through the API. Use <code className="bg-blue-100 px-1 rounded">/api/models/{slug}/usage-examples</code> to add/edit examples.
                </p>
              </div>
            </div>
            <Link
              href={`/models/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Usage Examples on Public Page
            </Link>
          </div>
        )}

        {/* Changelog Tab */}
        {activeTab === 'changelog' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Changelog</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Changelog entries are managed through the API. Use <code className="bg-blue-100 px-1 rounded">/api/models/{slug}/changelog</code> to add/edit changelog entries.
                </p>
              </div>
            </div>
            <Link
              href={`/models/${slug}#changelog`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaEye />
              View Changelog on Public Page
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaInfoCircle />
            <span>
              {overrideFields.size > 0 ? (
                <>{overrideFields.size} field{overrideFields.size !== 1 ? 's' : ''} overridden</>
              ) : (
                'No fields overridden'
              )}
            </span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="border rounded-lg px-6 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
