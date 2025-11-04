'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBrain, FaArrowLeft, FaDownload, FaMagic, FaSave } from 'react-icons/fa';

export default function ImportModelPage() {
  const router = useRouter();
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
          if (errorData.stack && process.env.NODE_ENV === 'development') {
            console.error('Fetch error details:', errorData);
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFetchedData(data.model);
      setFormData(prev => ({
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
      // Determine if we should auto-approve (publish) based on formData status
      const shouldPublish = formData.status === 'published';
      
      console.log('Importing with settings:', {
        identifier,
        status: formData.status,
        auto_approval: shouldPublish,
        formData
      });

      // Use the full import endpoint with enrichment
      const response = await fetch('/api/admin/import/models/huggingface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier, // Use the identifier from the input
          auto_approval: shouldPublish,
          apply_enrichment: true
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to import model';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorData.message || errorMessage;
          if (errorData.stack && process.env.NODE_ENV === 'development') {
            console.error('Import error details:', errorData);
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      alert(result.message || 'Model imported successfully');
      router.push('/admin/content/models');
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Failed to import model: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Form */}
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
              <p className="text-xs text-gray-500 mt-1">
                Choose whether to publish the model immediately or save as draft
              </p>
            </div>

            <button
              onClick={handleFetch}
              disabled={loading || !identifier}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Fetching...' : (
                <>
                  <FaDownload /> Fetch Model Data
                </>
              )}
            </button>

            {fetchedData && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {importing ? 'Importing...' : (
                  <>
                    <FaSave /> Import Model ({formData.status === 'published' ? 'Will be Published' : 'Will be Draft'})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {fetchedData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Name:</strong> {fetchedData.name}
              </div>
              <div>
                <strong>Developer:</strong> {fetchedData.developer}
              </div>
              <div>
                <strong>Type:</strong> {fetchedData.model_type}
              </div>
              <div>
                <strong>Description:</strong> {fetchedData.description?.substring(0, 100)}...
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Downloads:</strong> {fetchedData.download_count ?? fetchedData.import_metadata?.downloads ?? 0}
                </div>
                <div>
                  <strong>License:</strong> {fetchedData.license || fetchedData.import_metadata?.license || 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Library:</strong> {fetchedData.import_metadata?.library_name || 'N/A'}
                </div>
                <div>
                  <strong>Likes:</strong> {fetchedData.import_metadata?.likes ?? 0}
                </div>
              </div>
              {Array.isArray(fetchedData.tags) && fetchedData.tags.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {fetchedData.tags.slice(0, 10).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {fetchedData.import_metadata?.files && Array.isArray(fetchedData.import_metadata.files) && (
                <div>
                  <strong>Files:</strong> {fetchedData.import_metadata.files.length}
                </div>
              )}
              {fetchedData.import_metadata?.configs?.['config.json'] && (
                <div>
                  <strong>Config:</strong> <span className="text-gray-600">loaded</span>
                </div>
              )}
              {fetchedData.huggingface_url && (
                <div>
                  <a className="text-blue-600 hover:text-blue-800" href={fetchedData.huggingface_url} target="_blank">View on Hugging Face →</a>
                </div>
              )}
              {fetchedData.import_metadata?.readme && (
                <div className="pt-2">
                  <strong>README:</strong>
                  <p className="text-gray-600 text-xs mt-1 whitespace-pre-wrap">
                    {fetchedData.import_metadata.readme.substring(0, 400)}{fetchedData.import_metadata.readme.length > 400 ? '…' : ''}
                  </p>
                </div>
              )}
              {fetchedData.ideal_hardware && (
                <div className="bg-blue-50 p-3 rounded">
                  <strong className="text-blue-700">💻 Ideal Hardware:</strong>
                  <p className="text-blue-600">{fetchedData.ideal_hardware}</p>
                </div>
              )}
              {fetchedData.risk_score && (
                <div className="bg-yellow-50 p-3 rounded">
                  <strong className="text-yellow-700">⚠️ Risk Score:</strong>
                  <p className="text-yellow-600">{fetchedData.risk_score}/100</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

