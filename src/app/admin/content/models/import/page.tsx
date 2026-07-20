'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaBrain, FaArrowLeft, FaDownload, FaSave, FaLayerGroup,
  FaSync, FaClock, FaCheckCircle, FaTimesCircle, FaMinusCircle
} from 'react-icons/fa';

type ImportMode = 'single' | 'bulk' | 'autosync';

export default function ImportModelPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode>('single');

  // Single import
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [importSource, setImportSource] = useState('huggingface');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    status: 'draft',
    featured: false,
    apply_enrichment: true
  });

  // Bulk import
  const [bulkMode, setBulkMode] = useState<'discover' | 'list'>('discover');
  const [bulkIdentifiers, setBulkIdentifiers] = useState('');
  const [bulkSort, setBulkSort] = useState('downloads');
  const [bulkLimit, setBulkLimit] = useState(20);
  const [bulkPipelineTag, setBulkPipelineTag] = useState('');
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkStatus, setBulkStatus] = useState('draft');
  const [bulkSkipExisting, setBulkSkipExisting] = useState(true);
  const [bulkEnrichment, setBulkEnrichment] = useState(true);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  // Auto sync
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncSaving, setSyncSaving] = useState(false);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    enabled: false,
    auto_approval: false,
    import_limit: 20,
    import_interval: 'every_6_hours',
    schedule_cron: '0 */6 * * *',
    sort: 'createdAt',
    pipeline_tag: '',
    apply_enrichment: true,
    last_sync: null as string | null,
    sync_status: 'idle',
    error_log: null as string | null,
  });
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    if (mode === 'autosync') {
      loadSyncSettings();
    }
  }, [mode]);

  const loadSyncSettings = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/admin/import/models/huggingface/sync');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load sync settings');

      const filters =
        typeof data.settings?.filters === 'string'
          ? JSON.parse(data.settings.filters || '{}')
          : data.settings?.filters || {};

      setSyncSettings({
        enabled: Boolean(data.settings?.enabled),
        auto_approval: Boolean(data.settings?.auto_approval),
        import_limit: data.settings?.import_limit || 20,
        import_interval: data.settings?.import_interval || 'every_6_hours',
        schedule_cron: data.settings?.schedule_cron || '0 */6 * * *',
        sort: filters.sort || 'createdAt',
        pipeline_tag: filters.pipeline_tag || '',
        apply_enrichment: filters.apply_enrichment !== false,
        last_sync: data.settings?.last_sync || null,
        sync_status: data.settings?.sync_status || 'idle',
        error_log: data.settings?.error_log || null,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to load auto-sync settings');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!identifier) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/import/models/${importSource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, auto_approval: false, apply_enrichment: false })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch model data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFetchedData(data.model);
      setFormData((prev: any) => ({
        ...prev,
        name: data.model.name,
        slug: data.model.slug,
        description: data.model.description,
        ideal_hardware: data.model.ideal_hardware,
        risk_score: data.model.risk_score
      }));
    } catch (error: any) {
      alert(error.message || 'Failed to fetch from ' + importSource);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!identifier) {
      alert('Please enter a model identifier');
      return;
    }

    setImporting(true);
    try {
      const shouldPublish = formData.status === 'published';
      const response = await fetch('/api/admin/import/models/huggingface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          auto_approval: shouldPublish,
          apply_enrichment: true
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to import model';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      alert(result.message || 'Model imported successfully');
      router.push('/admin/content/models');
    } catch (error: any) {
      alert(`Failed to import model: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleBulkImport = async () => {
    setBulkRunning(true);
    setBulkResult(null);
    try {
      const identifiers = bulkIdentifiers
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (bulkMode === 'list' && identifiers.length === 0) {
        throw new Error('Paste at least one model identifier');
      }

      const response = await fetch('/api/admin/import/models/huggingface/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: bulkMode === 'discover' ? 'discover' : 'identifiers',
          identifiers,
          sort: bulkSort,
          limit: bulkLimit,
          pipeline_tag: bulkPipelineTag || undefined,
          search: bulkSearch || undefined,
          auto_approval: bulkStatus === 'published',
          apply_enrichment: bulkEnrichment,
          skip_existing: bulkSkipExisting,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Bulk import failed');
      }

      setBulkResult(data);
    } catch (error: any) {
      alert(error.message || 'Bulk import failed');
    } finally {
      setBulkRunning(false);
    }
  };

  const saveSyncSettings = async () => {
    setSyncSaving(true);
    try {
      const response = await fetch('/api/admin/import/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_name: 'huggingface',
          enabled: syncSettings.enabled,
          auto_approval: syncSettings.auto_approval,
          import_limit: syncSettings.import_limit,
          import_interval: syncSettings.import_interval,
          schedule_cron: syncSettings.schedule_cron,
          filters: {
            sort: syncSettings.sort,
            pipeline_tag: syncSettings.pipeline_tag,
            apply_enrichment: syncSettings.apply_enrichment,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      alert('Auto-sync settings saved');
      await loadSyncSettings();
    } catch (error: any) {
      alert(error.message || 'Failed to save settings');
    } finally {
      setSyncSaving(false);
    }
  };

  const runSyncNow = async () => {
    setSyncRunning(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/import/models/huggingface/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, limit: syncSettings.import_limit }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Sync failed');
      }
      setSyncResult(data);
      await loadSyncSettings();
    } catch (error: any) {
      alert(error.message || 'Sync failed');
    } finally {
      setSyncRunning(false);
    }
  };

  const tabs: Array<{ id: ImportMode; label: string; icon: any }> = [
    { id: 'single', label: 'Single Import', icon: FaDownload },
    { id: 'bulk', label: 'Bulk Import', icon: FaLayerGroup },
    { id: 'autosync', label: 'Auto Sync', icon: FaSync },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaBrain className="text-red-600" />
          Import Model from External Source
        </h1>
        <p className="text-gray-600 mt-2">
          Import one model, bulk-import a batch from HuggingFace, or enable scheduled sync for newer models.
          HuggingFace hosts millions of models — imports run in limited batches.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 ${
                  mode === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Import Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="huggingface">HuggingFace</option>
                  <option value="paperswithcode">Papers with Code</option>
                  <option value="arxiv">arXiv</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Identifier / URL
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g., microsoft/DialoGPT-large"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <button
                onClick={handleFetch}
                disabled={loading || !identifier}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Fetching...' : (<><FaDownload /> Fetch Model Data</>)}
              </button>

              {fetchedData && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : (<><FaSave /> Import Model</>)}
                </button>
              )}
            </div>
          </div>

          {fetchedData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Preview</h2>
              <div className="space-y-3 text-sm">
                <div><strong>Name:</strong> {fetchedData.name}</div>
                <div><strong>Developer:</strong> {fetchedData.developer}</div>
                <div><strong>Type:</strong> {fetchedData.model_type}</div>
                <div><strong>Description:</strong> {fetchedData.description?.substring(0, 120)}...</div>
                {fetchedData.huggingface_url && (
                  <a className="text-blue-600 hover:text-blue-800" href={fetchedData.huggingface_url} target="_blank" rel="noreferrer">
                    View on Hugging Face →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">Bulk Import</h2>
            <p className="text-sm text-gray-600">
              Discover top/new HuggingFace models or paste a list. Max 100 models per run.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setBulkMode('discover')}
                className={`px-3 py-2 rounded text-sm ${bulkMode === 'discover' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Discover from HuggingFace
              </button>
              <button
                onClick={() => setBulkMode('list')}
                className={`px-3 py-2 rounded text-sm ${bulkMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Paste Identifiers
              </button>
            </div>

            {bulkMode === 'discover' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select value={bulkSort} onChange={(e) => setBulkSort(e.target.value)} className="w-full border rounded px-3 py-2">
                    <option value="downloads">Most downloads</option>
                    <option value="likes">Most likes</option>
                    <option value="createdAt">Newest created</option>
                    <option value="lastModified">Recently updated</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Limit (1–100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkLimit}
                    onChange={(e) => setBulkLimit(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline / Task (optional)</label>
                  <input
                    type="text"
                    value={bulkPipelineTag}
                    onChange={(e) => setBulkPipelineTag(e.target.value)}
                    placeholder="e.g. text-generation, image-text-to-text"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search (optional)</label>
                  <input
                    type="text"
                    value={bulkSearch}
                    onChange={(e) => setBulkSearch(e.target.value)}
                    placeholder="e.g. llama, mistral"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model IDs (one per line or comma-separated)
                </label>
                <textarea
                  value={bulkIdentifiers}
                  onChange={(e) => setBulkIdentifiers(e.target.value)}
                  rows={10}
                  placeholder={'meta-llama/Llama-3.1-8B\nmicrosoft/phi-2\ngoogle/gemma-2-9b'}
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Import status</label>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={bulkSkipExisting} onChange={(e) => setBulkSkipExisting(e.target.checked)} />
              Skip models that already exist
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={bulkEnrichment} onChange={(e) => setBulkEnrichment(e.target.checked)} />
              Auto-fill AI Summary, Overview Guidance, FAQs, Install &amp; Usage docs
            </label>

            <button
              onClick={handleBulkImport}
              disabled={bulkRunning}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {bulkRunning ? 'Importing batch...' : (<><FaLayerGroup /> Start Bulk Import</>)}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            {!bulkResult ? (
              <p className="text-gray-500 text-sm">Run a bulk import to see results here.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{bulkResult.message}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 p-3 rounded">Imported: {bulkResult.summary?.imported || 0}</div>
                  <div className="bg-blue-50 p-3 rounded">Updated: {bulkResult.summary?.updated || 0}</div>
                  <div className="bg-gray-50 p-3 rounded">Skipped: {bulkResult.summary?.skipped || 0}</div>
                  <div className="bg-red-50 p-3 rounded">Failed: {bulkResult.summary?.failed || 0}</div>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {(bulkResult.results || []).map((item: any) => (
                    <div key={item.identifier} className="flex items-start gap-2 text-sm border-b pb-2">
                      {item.status === 'imported' || item.status === 'updated' ? (
                        <FaCheckCircle className="text-green-600 mt-0.5" />
                      ) : item.status === 'skipped' ? (
                        <FaMinusCircle className="text-gray-500 mt-0.5" />
                      ) : (
                        <FaTimesCircle className="text-red-600 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium">{item.identifier}</div>
                        <div className="text-gray-500">{item.status}: {item.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'autosync' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaClock className="text-red-600" /> Auto Sync Scheduler
            </h2>
            <p className="text-sm text-gray-600">
              Periodically scan HuggingFace for newer models and import ones missing from your database.
              Requires a cron caller (Vercel Cron uses <code className="bg-gray-100 px-1 rounded">vercel.json</code>).
            </p>

            {syncLoading ? (
              <p className="text-gray-500">Loading settings...</p>
            ) : (
              <>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={syncSettings.enabled}
                    onChange={(e) => setSyncSettings({ ...syncSettings, enabled: e.target.checked })}
                  />
                  Enable scheduled auto-sync
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={syncSettings.auto_approval}
                    onChange={(e) => setSyncSettings({ ...syncSettings, auto_approval: e.target.checked })}
                  />
                  Auto-publish imported models
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Models per sync run</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={syncSettings.import_limit}
                    onChange={(e) => setSyncSettings({ ...syncSettings, import_limit: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discover sort</label>
                  <select
                    value={syncSettings.sort}
                    onChange={(e) => setSyncSettings({ ...syncSettings, sort: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="createdAt">Newest created</option>
                    <option value="lastModified">Recently updated</option>
                    <option value="downloads">Most downloads</option>
                    <option value="likes">Most likes</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline filter (optional)</label>
                  <input
                    type="text"
                    value={syncSettings.pipeline_tag}
                    onChange={(e) => setSyncSettings({ ...syncSettings, pipeline_tag: e.target.value })}
                    placeholder="e.g. text-generation"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cron expression</label>
                  <input
                    type="text"
                    value={syncSettings.schedule_cron}
                    onChange={(e) => setSyncSettings({ ...syncSettings, schedule_cron: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default every 6 hours: <code>0 */6 * * *</code>. Endpoint: <code>/api/cron/huggingface-models</code>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveSyncSettings}
                    disabled={syncSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {syncSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                  <button
                    onClick={runSyncNow}
                    disabled={syncRunning}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {syncRunning ? 'Syncing...' : 'Run Sync Now'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">Sync Status</h2>
            <div className="text-sm space-y-2">
              <div><strong>Enabled:</strong> {syncSettings.enabled ? 'Yes' : 'No'}</div>
              <div><strong>Status:</strong> {syncSettings.sync_status || 'idle'}</div>
              <div><strong>Last sync:</strong> {syncSettings.last_sync ? new Date(syncSettings.last_sync).toLocaleString() : 'Never'}</div>
              {syncSettings.error_log && (
                <div className="bg-red-50 text-red-700 p-3 rounded">{syncSettings.error_log}</div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 space-y-2">
              <p className="font-medium">How scheduling works</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enable auto-sync and save settings.</li>
                <li>Set <code>CRON_SECRET</code> in env.</li>
                <li>On Vercel, cron runs every 6 hours via <code>vercel.json</code>.</li>
                <li>Locally, call: <code>GET /api/cron/huggingface-models</code> with Bearer token.</li>
              </ol>
            </div>

            {syncResult && (
              <div className="border-t pt-4 space-y-2 text-sm">
                <p>{syncResult.message}</p>
                {syncResult.summary && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 p-2 rounded">Imported: {syncResult.summary.imported}</div>
                    <div className="bg-red-50 p-2 rounded">Failed: {syncResult.summary.failed}</div>
                    <div className="bg-gray-50 p-2 rounded">Skipped: {syncResult.summary.skipped}</div>
                    <div className="bg-blue-50 p-2 rounded">Total: {syncResult.summary.total}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
