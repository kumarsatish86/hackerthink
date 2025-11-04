'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaDatabase, FaArrowLeft, FaDownload, FaSave } from 'react-icons/fa';

export default function ImportDatasetPage() {
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
      const response = await fetch(`/api/admin/import/datasets/${importSource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, auto_approval: false, apply_enrichment: false })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch');
      }

      const data = await response.json();
      setFetchedData(data.dataset);
      setFormData(prev => ({
        ...prev,
        name: data.dataset.name,
        slug: data.dataset.slug,
        description: data.dataset.description
      }));
    } catch (error: any) {
      alert(error.message || 'Failed to fetch from ' + importSource);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fetchedData) return;

    setImporting(true);
    try {
      // Generate slug if not present
      const datasetName = fetchedData.name || formData.name;
      const datasetSlug = fetchedData.slug || formData.slug || 
        datasetName?.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') || 
        identifier.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      if (!datasetName || !datasetSlug) {
        throw new Error('Dataset name and slug are required');
      }

      // Get status from formData - ensure it's properly set
      const selectedStatus = formData.status || 'draft';
      console.log('Import status:', selectedStatus, 'formData.status:', formData.status);
      
      // Prepare data for import - ensure all required fields are present
      const importData: any = {
        name: datasetName,
        slug: datasetSlug,
        provider: fetchedData.provider || 'HuggingFace',
        description: fetchedData.description || formData.description,
        full_description: fetchedData.full_description || fetchedData.description,
        dataset_type: fetchedData.dataset_type || 'general',
        format: fetchedData.format || null,
        size: fetchedData.size || null,
        rows: fetchedData.rows || null,
        columns: fetchedData.columns || null,
        language: fetchedData.language || null,
        domain: fetchedData.domain || null,
        license: fetchedData.license || null,
        status: selectedStatus, // Use the explicitly set status
        featured: formData.featured || false,
        
        // Handle JSONB fields - convert arrays/objects to proper format
        languages: Array.isArray(fetchedData.languages) ? fetchedData.languages : 
                   (fetchedData.languages ? [fetchedData.languages] : []),
        features: fetchedData.features || {},
        split_info: fetchedData.split_info || {},
        task_types: Array.isArray(fetchedData.task_types) ? fetchedData.task_types : [],
        categories: Array.isArray(fetchedData.categories) ? fetchedData.categories : [],
        tags: Array.isArray(fetchedData.tags) ? fetchedData.tags : [],
        sample_data: fetchedData.sample_data || {},
        schema_json: fetchedData.schema_json || {},
        
        // Links
        download_url: fetchedData.download_url || null,
        huggingface_url: fetchedData.huggingface_url || `https://huggingface.co/datasets/${identifier}`,
        kaggle_url: fetchedData.kaggle_url || null,
        github_url: fetchedData.github_url || null,
        paper_url: fetchedData.paper_url || null,
        documentation_url: fetchedData.documentation_url || null,
        citation: fetchedData.citation || null,
        doi: fetchedData.doi || null,
        
        // Additional fields
        logo_url: fetchedData.logo_url || null,
        featured_image: fetchedData.featured_image || null,
        quality_score: fetchedData.quality_score || null,
        version: fetchedData.version || null,
        release_date: fetchedData.release_date || null,
        last_updated: fetchedData.last_updated || null,
        
        // SEO
        seo_title: fetchedData.seo_title || null,
        seo_description: fetchedData.seo_description || fetchedData.description?.substring(0, 160) || null,
        seo_keywords: fetchedData.seo_keywords || null,
      };

      const response = await fetch('/api/admin/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to import dataset';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
          console.error('Import error details:', errorData);
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Dataset imported successfully:', result);
      router.push('/admin/content/datasets');
    } catch (error: any) {
      console.error('Import error:', error);
      console.error('Error stack:', error.stack);
      alert(error.message || 'Failed to import dataset. Please check the console for details.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/datasets" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Datasets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaDatabase className="text-blue-600" />
          Import Dataset from External Source
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
                Dataset Identifier / URL
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g., squad, wikitext"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={handleFetch}
              disabled={loading || !identifier}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Fetching...' : (
                <>
                  <FaDownload /> Fetch Dataset Data
                </>
              )}
            </button>

            {fetchedData && (
              <>
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
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : (
                    <>
                      <FaSave /> Import Dataset
                    </>
                  )}
                </button>
              </>
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
                <strong>Provider:</strong> {fetchedData.provider || 'N/A'}
              </div>
              <div>
                <strong>Type:</strong> {fetchedData.dataset_type}
              </div>
              <div>
                <strong>Description:</strong> {fetchedData.description?.substring(0, 100)}...
              </div>
              {fetchedData.download_count && (
                <div className="bg-green-50 p-3 rounded">
                  <strong className="text-green-700">📥 Downloads:</strong>
                  <p className="text-green-600">{fetchedData.download_count.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

