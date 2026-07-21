'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaDatabase, FaArrowLeft, FaDownload, FaSave, FaLayerGroup,
  FaSync, FaClock, FaCheckCircle, FaTimesCircle, FaMinusCircle,
} from 'react-icons/fa';

type ImportMode = 'single' | 'bulk' | 'autosync';

export default function ImportDatasetPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode>('single');

  // Single
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [importSource, setImportSource] = useState('huggingface');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [formData, setFormData] = useState({ status: 'draft', apply_enrichment: true });

  // Bulk
  const [bulkMode, setBulkMode] = useState<'discover' | 'list'>('discover');
  const [bulkIdentifiers, setBulkIdentifiers] = useState('');
  const [bulkSort, setBulkSort] = useState('downloads');
  const [bulkLimit, setBulkLimit] = useState(20);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkFilter, setBulkFilter] = useState('');
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
    search: '',
    filter: '',
    apply_enrichment: true,
    last_sync: null as string | null,
    sync_status: 'idle',
    error_log: null as string | null,
  });
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    if (mode === 'autosync') loadSyncSettings();
  }, [mode]);

  const loadSyncSettings = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/admin/import/datasets/huggingface/sync');
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
        search: filters.search || '',
        filter: filters.filter || '',
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
      const response = await fetch(`/api/admin/import/datasets/${importSource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, auto_approval: false, apply_enrichment: true }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.details || 'Failed to fetch');
      }
      const data = await response.json();
      setFetchedData(data.dataset);
    } catch (error: any) {
      alert(error.message || 'Failed to fetch from ' + importSource);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!identifier) {
      alert('Please enter a dataset identifier');
      return;
    }
    setImporting(true);
    try {
      const shouldPublish = formData.status === 'published';
      const response = await fetch('/api/admin/import/datasets/huggingface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          auto_approval: true,
          apply_enrichment: formData.apply_enrichment,
          status: shouldPublish ? 'published' : 'draft',
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.details || 'Import failed');
      }
      const data = await response.json();
      alert(data.message || 'Dataset imported successfully');
      router.push('/admin/content/datasets');
    } catch (error: any) {
      alert(`Failed to import dataset: ${error.message}`);
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
        throw new Error('Paste at least one dataset identifier');
      }

      const response = await fetch('/api/admin/import/datasets/huggingface/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: bulkMode === 'discover' ? 'discover' : 'identifiers',
          identifiers,
          sort: bulkSort,
          limit: bulkLimit,
          search: bulkSearch || undefined,
          filter: bulkFilter || undefined,
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
          source_name: 'huggingface_datasets',
          enabled: syncSettings.enabled,
          auto_approval: syncSettings.auto_approval,
          import_limit: syncSettings.import_limit,
          import_interval: syncSettings.import_interval,
          schedule_cron: syncSettings.schedule_cron,
          filters: {
            sort: syncSettings.sort,
            search: syncSettings.search,
            filter: syncSettings.filter,
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
      const response = await fetch('/api/admin/import/datasets/huggingface/sync', {
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

  const tabs: Array<{ id: ImportMode; label: string; icon: typeof FaDownload }> = [
    { id: 'single', label: 'Single Import', icon: FaDownload },
    { id: 'bulk', label: 'Bulk Import', icon: FaLayerGroup },
    { id: 'autosync', label: 'Auto Sync', icon: FaSync },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/datasets" className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900">
          <FaArrowLeft className="mr-2" /> Back to Datasets
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FaDatabase className="text-red-600" />
          Import Dataset from External Source
        </h1>
        <p className="mt-2 text-gray-600">
          Import one dataset, bulk-import a batch from Hugging Face, or enable scheduled sync for newer datasets.
          Hugging Face hosts hundreds of thousands of datasets — imports run in limited batches.
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-white shadow">
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium ${
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Import Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Source</label>
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="huggingface">Hugging Face</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dataset Identifier / URL
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g., allenai/c4 or squad"
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="border-t pt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.apply_enrichment}
                  onChange={(e) => setFormData({ ...formData, apply_enrichment: e.target.checked })}
                />
                Auto-fill AI summary, quality scores, and sample stubs
              </label>
              <button
                type="button"
                onClick={handleFetch}
                disabled={loading || !identifier}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Fetching...' : (<><FaDownload /> Fetch Dataset Data</>)}
              </button>
              {fetchedData && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : (<><FaSave /> Import Dataset</>)}
                </button>
              )}
            </div>
          </div>

          {fetchedData && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Preview</h2>
              <div className="space-y-3 text-sm">
                <div><strong>Name:</strong> {fetchedData.name}</div>
                <div><strong>Provider:</strong> {fetchedData.provider || 'N/A'}</div>
                <div><strong>Type:</strong> {fetchedData.dataset_type || 'N/A'}</div>
                <div><strong>Description:</strong> {fetchedData.description?.substring(0, 160)}…</div>
                {fetchedData.ai_summary && (
                  <div className="rounded bg-green-50 p-2 text-xs text-green-800">AI summary enrichment ready</div>
                )}
                {fetchedData.huggingface_url && (
                  <a
                    className="text-blue-600 hover:text-blue-800"
                    href={fetchedData.huggingface_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Hugging Face →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'bulk' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Bulk Import</h2>
            <p className="text-sm text-gray-600">
              Discover popular/new Hugging Face datasets or paste a list. Max 100 per run.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkMode('discover')}
                className={`rounded px-3 py-2 text-sm ${bulkMode === 'discover' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Discover from Hugging Face
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('list')}
                className={`rounded px-3 py-2 text-sm ${bulkMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                Paste Identifiers
              </button>
            </div>

            {bulkMode === 'discover' ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Sort by</label>
                  <select value={bulkSort} onChange={(e) => setBulkSort(e.target.value)} className="w-full rounded border px-3 py-2">
                    <option value="downloads">Most downloads</option>
                    <option value="likes">Most likes</option>
                    <option value="createdAt">Newest created</option>
                    <option value="lastModified">Recently updated</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Limit (1–100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkLimit}
                    onChange={(e) => setBulkLimit(Number(e.target.value))}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search (optional)</label>
                  <input
                    type="text"
                    value={bulkSearch}
                    onChange={(e) => setBulkSearch(e.target.value)}
                    placeholder="e.g. coco, glue, imagenet"
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">HF filter tag (optional)</label>
                  <input
                    type="text"
                    value={bulkFilter}
                    onChange={(e) => setBulkFilter(e.target.value)}
                    placeholder="e.g. task_categories:text-classification"
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dataset IDs (one per line or comma-separated)
                </label>
                <textarea
                  value={bulkIdentifiers}
                  onChange={(e) => setBulkIdentifiers(e.target.value)}
                  rows={10}
                  placeholder={'allenai/c4\nsquad\nimagenet-1k'}
                  className="w-full rounded border px-3 py-2 font-mono text-sm"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Import status</label>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full rounded border px-3 py-2">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={bulkSkipExisting} onChange={(e) => setBulkSkipExisting(e.target.checked)} />
              Skip datasets that already exist
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={bulkEnrichment} onChange={(e) => setBulkEnrichment(e.target.checked)} />
              Auto-fill AI summary, quality heuristics, and sample stubs
            </label>

            <button
              type="button"
              onClick={handleBulkImport}
              disabled={bulkRunning}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {bulkRunning ? 'Importing batch...' : (<><FaLayerGroup /> Start Bulk Import</>)}
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Results</h2>
            {!bulkResult ? (
              <p className="text-sm text-gray-500">Run a bulk import to see results here.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{bulkResult.message}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded bg-green-50 p-3">Imported: {bulkResult.summary?.imported || 0}</div>
                  <div className="rounded bg-blue-50 p-3">Updated: {bulkResult.summary?.updated || 0}</div>
                  <div className="rounded bg-gray-50 p-3">Skipped: {bulkResult.summary?.skipped || 0}</div>
                  <div className="rounded bg-red-50 p-3">Failed: {bulkResult.summary?.failed || 0}</div>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {(bulkResult.results || []).map((item: any) => (
                    <div key={item.identifier} className="flex items-start gap-2 border-b pb-2 text-sm">
                      {item.status === 'imported' || item.status === 'updated' ? (
                        <FaCheckCircle className="mt-0.5 text-green-600" />
                      ) : item.status === 'skipped' ? (
                        <FaMinusCircle className="mt-0.5 text-gray-500" />
                      ) : (
                        <FaTimesCircle className="mt-0.5 text-red-600" />
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <FaClock className="text-red-600" /> Auto Sync Scheduler
            </h2>
            <p className="text-sm text-gray-600">
              Periodically scan Hugging Face for newer datasets and import ones missing from your catalog.
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
                  Auto-publish imported datasets
                </label>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Datasets per sync run</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={syncSettings.import_limit}
                    onChange={(e) => setSyncSettings({ ...syncSettings, import_limit: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Discover sort</label>
                  <select
                    value={syncSettings.sort}
                    onChange={(e) => setSyncSettings({ ...syncSettings, sort: e.target.value })}
                    className="w-full rounded border px-3 py-2"
                  >
                    <option value="createdAt">Newest created</option>
                    <option value="lastModified">Recently updated</option>
                    <option value="downloads">Most downloads</option>
                    <option value="likes">Most likes</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search filter (optional)</label>
                  <input
                    type="text"
                    value={syncSettings.search}
                    onChange={(e) => setSyncSettings({ ...syncSettings, search: e.target.value })}
                    placeholder="e.g. vision"
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Cron expression</label>
                  <input
                    type="text"
                    value={syncSettings.schedule_cron}
                    onChange={(e) => setSyncSettings({ ...syncSettings, schedule_cron: e.target.value })}
                    className="w-full rounded border px-3 py-2 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default every 6 hours at :30. Endpoint: <code>/api/cron/huggingface-datasets</code>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveSyncSettings}
                    disabled={syncSaving}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {syncSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                  <button
                    type="button"
                    onClick={runSyncNow}
                    disabled={syncRunning}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {syncRunning ? 'Syncing...' : 'Run Sync Now'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Sync Status</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Enabled:</strong> {syncSettings.enabled ? 'Yes' : 'No'}</div>
              <div><strong>Status:</strong> {syncSettings.sync_status || 'idle'}</div>
              <div>
                <strong>Last sync:</strong>{' '}
                {syncSettings.last_sync ? new Date(syncSettings.last_sync).toLocaleString() : 'Never'}
              </div>
              {syncSettings.error_log && (
                <div className="rounded bg-red-50 p-3 text-red-700">{syncSettings.error_log}</div>
              )}
            </div>
            <div className="space-y-2 rounded bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-medium">How scheduling works</p>
              <ol className="list-inside list-decimal space-y-1">
                <li>Enable auto-sync and save settings.</li>
                <li>Set <code>CRON_SECRET</code> in env.</li>
                <li>On Vercel, cron hits <code>/api/cron/huggingface-datasets</code> every 6 hours.</li>
                <li>Locally: <code>GET /api/cron/huggingface-datasets</code> with Bearer token.</li>
              </ol>
            </div>
            {syncResult && (
              <div className="space-y-2 border-t pt-4 text-sm">
                <p>{syncResult.message}</p>
                {syncResult.summary && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-green-50 p-2">Imported: {syncResult.summary.imported}</div>
                    <div className="rounded bg-red-50 p-2">Failed: {syncResult.summary.failed}</div>
                    <div className="rounded bg-gray-50 p-2">Skipped: {syncResult.summary.skipped}</div>
                    <div className="rounded bg-blue-50 p-2">Total: {syncResult.summary.total}</div>
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
