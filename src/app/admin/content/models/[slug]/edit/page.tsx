'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaBrain, FaSave, FaArrowLeft, FaEye, FaMagic, FaSpinner, FaInfoCircle,
  FaCheckCircle, FaShieldAlt, FaPuzzlePiece, FaGamepad, FaRobot, FaChartLine,
  FaDownload, FaCode, FaQuestionCircle, FaFileAlt, FaLock, FaProjectDiagram,
  FaPlus, FaTrash,
} from 'react-icons/fa';
import RelationsManager from '@/components/admin/models/RelationsManager';

type AnyRecord = Record<string, any>;

const TABS = [
  { id: 'core', label: 'Core', icon: FaInfoCircle },
  { id: 'quick_facts', label: 'Quick Facts', icon: FaCheckCircle },
  { id: 'playground', label: 'Playground', icon: FaGamepad },
  { id: 'ai_summary', label: 'AI Summary', icon: FaRobot },
  { id: 'guidance', label: 'Guidance', icon: FaCheckCircle },
  { id: 'benchmarks', label: 'Benchmarks', icon: FaChartLine },
  { id: 'install', label: 'Install', icon: FaDownload },
  { id: 'usage', label: 'Usage', icon: FaCode },
  { id: 'faqs', label: 'FAQs', icon: FaQuestionCircle },
  { id: 'papers', label: 'Papers', icon: FaFileAlt },
  { id: 'security', label: 'Security', icon: FaLock },
  { id: 'relations', label: 'Relations', icon: FaProjectDiagram },
] as const;

type TabId = (typeof TABS)[number]['id'];

const QUICK_FACTS_FIELDS: Array<{ key: string; label: string; placeholder?: string }> = [
  { key: 'task', label: 'Task' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'model_size', label: 'Model Size', placeholder: 'e.g. 7B parameters' },
  { key: 'input_type', label: 'Input Type', placeholder: 'e.g. Text' },
  { key: 'output_type', label: 'Output Type', placeholder: 'e.g. Text' },
  { key: 'framework', label: 'Framework', placeholder: 'e.g. PyTorch' },
  { key: 'license', label: 'License' },
  { key: 'inference_speed', label: 'Inference Speed', placeholder: 'e.g. Fast' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'memory_usage', label: 'Memory Usage', placeholder: 'e.g. ~14GB (FP16)' },
  { key: 'gpu_requirement', label: 'GPU Requirement' },
  { key: 'cpu_requirement', label: 'CPU Requirement' },
  { key: 'quantized_versions', label: 'Quantized Versions', placeholder: 'e.g. GGUF, AWQ, GPTQ' },
  { key: 'training_dataset', label: 'Training Dataset' },
  { key: 'commercial_use', label: 'Commercial Use' },
  { key: 'offline_support', label: 'Offline Support' },
];

const AI_SUMMARY_ARRAY_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'advantages', label: 'Advantages' },
  { key: 'limitations', label: 'Limitations' },
  { key: 'ideal_use_cases', label: 'Ideal Use Cases' },
];

/** Maps to public Overview cards (Strengths, Weaknesses, Best Practices, …) via ai_models.overview_guidance */
const GUIDANCE_ARRAY_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'best_practices', label: 'Best Practices' },
  { key: 'common_mistakes', label: 'Common Mistakes' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'features', label: 'Features' },
  { key: 'known_limitations', label: 'Known Limitations' },
];

const GUIDANCE_TEXT_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'expected_performance', label: 'Expected Performance' },
  { key: 'commercial_usage', label: 'Commercial Usage' },
  { key: 'ethical_considerations', label: 'Ethical Considerations' },
];

function parseJsonObject(value: any): AnyRecord {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function parseStringArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function ModelDocsEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('core');

  const [model, setModel] = useState<AnyRecord | null>(null);
  const [quickFacts, setQuickFacts] = useState<AnyRecord>({});
  const [playgroundConfig, setPlaygroundConfig] = useState<AnyRecord>({});
  const [aiSummary, setAiSummary] = useState<AnyRecord>({});
  const [overviewGuidance, setOverviewGuidance] = useState<AnyRecord>({});
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({});

  const fetchModel = async () => {
    try {
      setFetchError(null);
      const res = await fetch(`/api/admin/models/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to fetch model');
      if (!data.model) throw new Error('Model data missing from API response');

      setModel(data.model);
      setQuickFacts(parseJsonObject(data.model.quick_facts));
      setPlaygroundConfig(parseJsonObject(data.model.playground_config));
      setAiSummary(parseJsonObject(data.model.ai_summary));
      setOverviewGuidance(parseJsonObject(data.model.overview_guidance));
    } catch (error: any) {
      setFetchError(error?.message || 'Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const updateModelField = (key: string, value: any) => {
    setModel((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const persist = async (overrides: AnyRecord = {}) => {
    if (!model) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        ...model,
        quick_facts: quickFacts,
        playground_config: playgroundConfig,
        ai_summary: aiSummary,
        overview_guidance: overviewGuidance,
        ...overrides,
      };
      const res = await fetch(`/api/admin/models/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to save');
      setModel(data.model);
      setSaveMessage('Saved successfully.');
    } catch (error: any) {
      setSaveMessage(error?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const regenerateDocs = async () => {
    if (!confirm('This will regenerate AI Summary, Quick Facts, Playground config, FAQs, Install Guides, Usage Examples, Papers seed and Security Notes from templates. Continue?')) return;
    setRegenerating(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/models/${slug}/regenerate-docs`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to regenerate docs');
      setSaveMessage(data.message || 'Documentation regenerated.');
      await fetchModel();
    } catch (error: any) {
      setSaveMessage(error?.message || 'Failed to regenerate docs');
    } finally {
      setRegenerating(false);
      setTimeout(() => setSaveMessage(null), 6000);
    }
  };

  const addArrayItem = (field: string, value: string, target: 'ai_summary' | 'guidance' = 'ai_summary') => {
    if (!value.trim()) return;
    if (target === 'guidance') {
      const current = parseStringArray(overviewGuidance[field]);
      setOverviewGuidance((prev) => ({ ...prev, [field]: [...current, value.trim()] }));
    } else {
      const current = parseStringArray(aiSummary[field]);
      setAiSummary((prev) => ({ ...prev, [field]: [...current, value.trim()] }));
    }
    setArrayInputs((prev) => ({ ...prev, [field]: '', [`guidance_${field}`]: '' }));
  };

  const removeGuidanceItem = (field: string, index: number) => {
    const current = parseStringArray(overviewGuidance[field]);
    setOverviewGuidance((prev) => ({
      ...prev,
      [field]: current.filter((_, i) => i !== index),
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    const current = parseStringArray(aiSummary[field]);
    setAiSummary((prev) => ({ ...prev, [field]: current.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center py-20">
        <FaSpinner className="animate-spin text-3xl text-red-500" />
      </div>
    );
  }

  if (fetchError || !model) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaInfoCircle className="mx-auto text-red-500 text-3xl mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Could not load model</h1>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <button
            onClick={() => { setLoading(true); fetchModel(); }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaBrain className="text-red-600" />
            Docs Editor — {model.name}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/content/models/${slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Edit Core Fields
            </Link>
            <Link
              href={`/models/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaEye /> View Public Page
            </Link>
            <button
              onClick={regenerateDocs}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {regenerating ? <FaSpinner className="animate-spin" /> : <FaMagic />}
              Regenerate AI Docs
            </button>
          </div>
        </div>
        {saveMessage && (
          <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-4 py-2">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b overflow-x-auto">
          <div className="flex space-x-1">
            {TABS.map((tab) => {
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

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'core' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaShieldAlt className="text-red-600" /> Core & Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(model.verified)}
                  onChange={(e) => updateModelField('verified', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Verified</label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(model.security_badge)}
                  onChange={(e) => updateModelField('security_badge', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Security Badge</label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(model.compatibility_badge)}
                  onChange={(e) => updateModelField('compatibility_badge', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Compatibility Badge</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                <input
                  type="text"
                  value={model.task || ''}
                  onChange={(e) => updateModelField('task', e.target.value)}
                  placeholder="e.g. text-generation"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                <input
                  type="text"
                  value={model.framework || ''}
                  onChange={(e) => updateModelField('framework', e.target.value)}
                  placeholder="e.g. PyTorch"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parameter Count (B)</label>
                <input
                  type="number"
                  step="0.01"
                  value={model.param_count_b ?? ''}
                  onChange={(e) => updateModelField('param_count_b', e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">External Model ID</label>
                <input
                  type="text"
                  value={model.external_model_id || ''}
                  onChange={(e) => updateModelField('external_model_id', e.target.value)}
                  placeholder="e.g. meta-llama/Llama-3-70B"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL</label>
                <input
                  type="url"
                  value={model.demo_url || ''}
                  onChange={(e) => updateModelField('demo_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Homepage URL</label>
                <input
                  type="url"
                  value={model.homepage_url || ''}
                  onChange={(e) => updateModelField('homepage_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={model.description || ''}
                onChange={(e) => updateModelField('description', e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'quick_facts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaCheckCircle className="text-red-600" /> Quick Facts</h2>
            <p className="text-sm text-gray-600">
              Shown in the model detail page&apos;s quick-facts panel. Use &quot;Regenerate AI Docs&quot; to auto-fill from the model&apos;s core fields.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {QUICK_FACTS_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={quickFacts[field.key] || ''}
                    onChange={(e) => setQuickFacts((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaGamepad className="text-red-600" /> Playground Configuration</h2>
            <p className="text-sm text-gray-600">
              Powers the live playground proxy at <code className="bg-gray-100 px-1 rounded">/api/models/{slug}/playground</code>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL</label>
                <input
                  type="url"
                  value={playgroundConfig.demo_url || ''}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, demo_url: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Embed URL</label>
                <input
                  type="url"
                  value={playgroundConfig.embed_url || ''}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, embed_url: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API URL (backend to proxy)</label>
                <input
                  type="url"
                  value={playgroundConfig.api_url || ''}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, api_url: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key (kept server-side)</label>
                <input
                  type="password"
                  value={playgroundConfig.api_key || ''}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, api_key: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modality</label>
                <select
                  value={playgroundConfig.modality || 'text'}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, modality: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hugging Face Space ID</label>
                <input
                  type="text"
                  value={playgroundConfig.space_id || ''}
                  onChange={(e) => setPlaygroundConfig((prev) => ({ ...prev, space_id: e.target.value }))}
                  placeholder="e.g. org/space-name"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai_summary' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaRobot className="text-red-600" /> AI Summary</h2>
            <div className="grid grid-cols-1 gap-6">
              {(['what', 'who', 'when_to_use', 'when_not_to_use'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{key.replace(/_/g, ' ')}</label>
                  <textarea
                    value={aiSummary[key] || ''}
                    onChange={(e) => setAiSummary((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={aiSummary.difficulty || 'beginner'}
                onChange={(e) => setAiSummary((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full md:w-64 border rounded-lg px-4 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {AI_SUMMARY_ARRAY_FIELDS.map((field) => {
              const items = parseStringArray(aiSummary[field.key]);
              const inputValue = arrayInputs[field.key] || '';
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setArrayInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field.key, inputValue);
                        }
                      }}
                      placeholder={`Add ${field.label.toLowerCase()}...`}
                      className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem(field.key, inputValue)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                        {item}
                        <button type="button" onClick={() => removeArrayItem(field.key, index)} className="text-red-600 hover:text-red-800">
                          <FaTrash className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'guidance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCheckCircle className="text-red-600" /> Overview Guidance
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                These lists power the Strengths, Weaknesses, Best Practices, and Common Mistakes cards on the public Overview.
                They are stored in <code className="rounded bg-gray-100 px-1">ai_models.overview_guidance</code> and can also be
                regenerated with &quot;Regenerate AI Docs&quot;.
              </p>
            </div>

            {GUIDANCE_TEXT_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                <textarea
                  value={overviewGuidance[field.key] || ''}
                  onChange={(e) => setOverviewGuidance((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            ))}

            {GUIDANCE_ARRAY_FIELDS.map((field) => {
              const items = parseStringArray(overviewGuidance[field.key]);
              const inputKey = `guidance_${field.key}`;
              const inputValue = arrayInputs[inputKey] || '';
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setArrayInputs((prev) => ({ ...prev, [inputKey]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field.key, inputValue, 'guidance');
                          setArrayInputs((prev) => ({ ...prev, [inputKey]: '' }));
                        }
                      }}
                      placeholder={`Add ${field.label.toLowerCase()}...`}
                      className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem(field.key, inputValue, 'guidance');
                        setArrayInputs((prev) => ({ ...prev, [inputKey]: '' }));
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                        {item}
                        <button type="button" onClick={() => removeGuidanceItem(field.key, index)} className="text-red-600 hover:text-red-800">
                          <FaTrash className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <RelationsManager
            slug={slug}
            type="benchmarks"
            title="Benchmarks"
            description="Scores are shown in the model's Benchmarks/Performance section and comparison tables."
            fields={[
              { key: 'benchmark_name', label: 'Benchmark Name', required: true },
              { key: 'score', label: 'Score', type: 'number' },
              { key: 'metric', label: 'Metric', placeholder: 'e.g. accuracy, F1' },
              { key: 'dataset', label: 'Dataset' },
              { key: 'evaluated_at', label: 'Evaluated On', type: 'date' },
              { key: 'source_url', label: 'Source URL' },
              { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
            ]}
            listColumns={['benchmark_name', 'score', 'metric', 'dataset']}
            emptyLabel="No benchmarks recorded yet."
          />
        )}

        {activeTab === 'install' && (
          <RelationsManager
            slug={slug}
            type="install_guides"
            title="Install Guides"
            description="Copy-paste install snippets shown on the model's Installation tab (pip, conda, Docker, vLLM, TGI, etc.)."
            fields={[
              { key: 'target', label: 'Target', required: true, placeholder: 'e.g. pip, docker, vllm' },
              { key: 'title', label: 'Title' },
              { key: 'command', label: 'Command' },
              { key: 'code', label: 'Full Code', type: 'code', span: 2 },
              { key: 'description', label: 'Description', type: 'textarea', span: 2 },
              { key: 'version_label', label: 'Version Label' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
            ]}
            listColumns={['target', 'title', 'command']}
            emptyLabel="No install guides yet."
          />
        )}

        {activeTab === 'usage' && (
          <RelationsManager
            slug={slug}
            type="usage_examples"
            title="Usage Examples"
            description="Runnable code snippets shown on the model's Usage Examples tab."
            fields={[
              { key: 'title', label: 'Title', required: true },
              { key: 'language', label: 'Language', required: true, placeholder: 'python, bash, javascript...' },
              { key: 'runtime', label: 'Runtime', placeholder: 'transformers, vllm, curl...' },
              { key: 'code', label: 'Code', type: 'code', span: 2, required: true },
              { key: 'description', label: 'Description', type: 'textarea', span: 2 },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
            ]}
            listColumns={['title', 'language', 'runtime']}
            emptyLabel="No usage examples yet."
          />
        )}

        {activeTab === 'faqs' && (
          <RelationsManager
            slug={slug}
            type="faqs"
            title="FAQs"
            description="Rendered on the public model page and used to build FAQPage schema.org markup."
            fields={[
              { key: 'question', label: 'Question', type: 'textarea', required: true, span: 2 },
              { key: 'answer', label: 'Answer', type: 'textarea', required: true, span: 2 },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
            ]}
            listColumns={['question', 'answer']}
            emptyLabel="No FAQs yet."
          />
        )}

        {activeTab === 'papers' && (
          <RelationsManager
            slug={slug}
            type="papers"
            title="Papers"
            description="Research papers linked to this model (original paper, related work, benchmarks, surveys)."
            fields={[
              { key: 'title', label: 'Title', required: true, span: 2 },
              { key: 'authors', label: 'Authors' },
              { key: 'conference', label: 'Conference / Venue' },
              { key: 'published_at', label: 'Published On', type: 'date' },
              { key: 'url', label: 'URL' },
              { key: 'paper_type', label: 'Type', type: 'select', options: ['original', 'related', 'benchmark', 'survey'] },
              { key: 'bibtex', label: 'BibTeX', type: 'textarea', span: 2 },
            ]}
            listColumns={['title', 'authors', 'published_at']}
            emptyLabel="No papers linked yet."
          />
        )}

        {activeTab === 'security' && (
          <RelationsManager
            slug={slug}
            type="security_notes"
            title="Security & Compliance Notes"
            description="Shown on the model's Security & Compliance section (data privacy, bias, content safety, licensing, misuse, supply-chain)."
            fields={[
              { key: 'note_type', label: 'Note Type', required: true, placeholder: 'data_privacy, bias_fairness, content_safety...' },
              { key: 'title', label: 'Title' },
              { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
              { key: 'body', label: 'Body', type: 'textarea', required: true, span: 2 },
            ]}
            listColumns={['note_type', 'title', 'severity']}
            emptyLabel="No security notes yet."
          />
        )}

        {activeTab === 'relations' && (
          <div className="space-y-10">
            <RelationsManager
              slug={slug}
              type="variants"
              title="Variants"
              description="Sibling checkpoints of this model (different sizes or quantizations)."
              fields={[
                { key: 'name', label: 'Name', required: true },
                { key: 'variant_type', label: 'Variant Type', placeholder: 'size, quantization...' },
                { key: 'parameters', label: 'Parameters' },
                { key: 'quantization', label: 'Quantization' },
                { key: 'variant_model_id', label: 'Linked Model ID (UUID, optional)' },
                { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
                { key: 'sort_order', label: 'Sort Order', type: 'number' },
              ]}
              listColumns={['name', 'variant_type', 'parameters']}
              emptyLabel="No variants yet."
            />

            <RelationsManager
              slug={slug}
              type="comparisons"
              title="Comparison Peers"
              description="Peer models referenced for head-to-head comparison. Enter the peer's slug to auto-link it."
              fields={[
                { key: 'peer_slug', label: 'Peer Model Slug', required: true, placeholder: 'e.g. llama-3-70b' },
                { key: 'notes', label: 'Notes', type: 'textarea', span: 2 },
                { key: 'sort_order', label: 'Sort Order', type: 'number' },
              ]}
              listColumns={['peer_slug', 'notes']}
              emptyLabel="No comparison peers yet."
            />

            <RelationsManager
              slug={slug}
              type="community_links"
              title="Community Links"
              description="Discord, Reddit, forums, and other community resources for this model."
              fields={[
                { key: 'title', label: 'Title', required: true },
                { key: 'url', label: 'URL', required: true },
                { key: 'link_type', label: 'Type', type: 'select', options: ['community', 'discord', 'reddit', 'forum', 'blog', 'other'] },
              ]}
              listColumns={['title', 'url', 'link_type']}
              emptyLabel="No community links yet."
            />
          </div>
        )}
      </div>

      {['core', 'quick_facts', 'playground', 'ai_summary', 'guidance'].includes(activeTab) && (
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/content/models')}
            className="border rounded-lg px-6 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => persist()}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
