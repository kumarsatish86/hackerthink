'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaDatabase, FaSave, FaArrowLeft } from 'react-icons/fa';

export default function EditDatasetPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datasetId, setDatasetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    slug: '',
    provider: '',
    description: '',
    full_description: '',
    dataset_type: '',
    version: '',
    release_date: '',
    last_updated: '',
    status: 'draft',
    featured: false,
    
    // Technical Specifications
    format: '',
    size: '',
    rows: '',
    columns: '',
    languages: '', // JSON array as string input
    features: '', // JSON object as string input
    split_info: '', // JSON object as string input
    preprocessing_info: '',
    compression: '',
    
    // Content & Description
    domain: '',
    task_types: '', // JSON array as string input
    categories: '', // JSON array as string input
    tags: '', // JSON array as string input
    sample_data: '', // JSON object as string input
    data_sources: '',
    
    // Links & Access
    download_url: '',
    huggingface_url: '',
    kaggle_url: '',
    github_url: '',
    paper_url: '',
    documentation_url: '',
    citation: '',
    doi: '',
    
    // Quality & Ethics
    quality_score: '',
    collection_method: '',
    ethical_considerations: '',
    bias_notes: '',
    pii_present: false,
    pii_description: '',
    
    // Visual & Media
    logo_url: '',
    featured_image: '',
    
    // SEO
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    
    // Additional
    schema_json: '', // JSON object as string input
    changelog: '',
    accessibility: '',
    rating: 0,
    rating_count: 0,
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'technical', label: 'Technical Specs' },
    { id: 'content', label: 'Content' },
    { id: 'links', label: 'Links & Access' },
    { id: 'quality', label: 'Quality & Ethics' },
    { id: 'media', label: 'Media & SEO' },
    { id: 'additional', label: 'Additional' },
  ];

  useEffect(() => {
    if (slug) {
      fetchDataset();
    }
  }, [slug]);

  const fetchDataset = async () => {
    try {
      // Try fetching by slug first
      const response = await fetch(`/api/admin/datasets/${slug}`);
      if (!response.ok) {
        // If slug route fails, try by ID (if slug is a UUID)
        if (response.status === 404) {
          throw new Error('Dataset not found');
        }
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.dataset) {
        populateForm(data.dataset);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching dataset:', error);
      alert(error.message || 'Failed to fetch dataset');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (dataset: any) => {
    setDatasetId(dataset.id);
    setFormData({
      name: dataset.name || '',
      slug: dataset.slug || '',
      provider: dataset.provider || '',
      description: dataset.description || '',
      full_description: dataset.full_description || '',
      dataset_type: dataset.dataset_type || '',
      version: dataset.version || '',
      release_date: dataset.release_date || '',
      last_updated: dataset.last_updated || '',
      status: dataset.status || 'draft',
      featured: dataset.featured || false,
      
      format: dataset.format || '',
      size: dataset.size || '',
      rows: dataset.rows || '',
      columns: dataset.columns || '',
      languages: typeof dataset.languages === 'object' ? JSON.stringify(dataset.languages || []) : (dataset.languages || ''),
      features: typeof dataset.features === 'object' ? JSON.stringify(dataset.features || {}) : (dataset.features || ''),
      split_info: typeof dataset.split_info === 'object' ? JSON.stringify(dataset.split_info || {}) : (dataset.split_info || ''),
      preprocessing_info: dataset.preprocessing_info || '',
      compression: dataset.compression || '',
      
      domain: dataset.domain || '',
      task_types: typeof dataset.task_types === 'object' ? JSON.stringify(dataset.task_types || []) : (dataset.task_types || ''),
      categories: typeof dataset.categories === 'object' ? JSON.stringify(dataset.categories || []) : (dataset.categories || ''),
      tags: typeof dataset.tags === 'object' ? JSON.stringify(dataset.tags || []) : (dataset.tags || ''),
      sample_data: typeof dataset.sample_data === 'object' ? JSON.stringify(dataset.sample_data || {}) : (dataset.sample_data || ''),
      data_sources: dataset.data_sources || '',
      
      download_url: dataset.download_url || '',
      huggingface_url: dataset.huggingface_url || '',
      kaggle_url: dataset.kaggle_url || '',
      github_url: dataset.github_url || '',
      paper_url: dataset.paper_url || '',
      documentation_url: dataset.documentation_url || '',
      citation: dataset.citation || '',
      doi: dataset.doi || '',
      
      quality_score: dataset.quality_score || '',
      collection_method: dataset.collection_method || '',
      ethical_considerations: dataset.ethical_considerations || '',
      bias_notes: dataset.bias_notes || '',
      pii_present: dataset.pii_present || false,
      pii_description: dataset.pii_description || '',
      
      logo_url: dataset.logo_url || '',
      featured_image: dataset.featured_image || '',
      
      seo_title: dataset.seo_title || '',
      seo_description: dataset.seo_description || '',
      seo_keywords: dataset.seo_keywords || '',
      
      schema_json: typeof dataset.schema_json === 'object' ? JSON.stringify(dataset.schema_json || {}) : (dataset.schema_json || ''),
      changelog: dataset.changelog || '',
      accessibility: dataset.accessibility || '',
      rating: dataset.rating || 0,
      rating_count: dataset.rating_count || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Parse JSON fields
      const submitData = {
        ...formData,
        languages: formData.languages ? JSON.parse(formData.languages) : [],
        features: formData.features ? JSON.parse(formData.features) : {},
        split_info: formData.split_info ? JSON.parse(formData.split_info) : {},
        task_types: formData.task_types ? JSON.parse(formData.task_types) : [],
        categories: formData.categories ? JSON.parse(formData.categories) : [],
        tags: formData.tags ? JSON.parse(formData.tags) : [],
        sample_data: formData.sample_data ? JSON.parse(formData.sample_data) : {},
        schema_json: formData.schema_json ? JSON.parse(formData.schema_json) : {},
        quality_score: formData.quality_score ? parseFloat(formData.quality_score) : null,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        rating_count: formData.rating_count ? parseInt(formData.rating_count) : 0,
      };

      const response = await fetch(`/api/admin/datasets/${datasetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update dataset';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      router.push('/admin/content/datasets');
    } catch (error: any) {
      console.error('Error updating dataset:', error);
      alert(error.message || 'Failed to update dataset');
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
  };

  const renderField = (
    label: string,
    name: string,
    type: 'text' | 'textarea' | 'select' | 'number' | 'date' = 'text',
    options?: string[],
    placeholder?: string,
    required?: boolean
  ) => {
    if (type === 'textarea') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name={name}
            value={formData[name as keyof typeof formData] as string}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            rows={4}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={name}
            value={formData[name as keyof typeof formData] as string}
            onChange={handleChange}
            required={required}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select {label}</option>
            {options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name as keyof typeof formData] as string || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/datasets" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Datasets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaDatabase className="text-red-600" />
          Edit Dataset
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Dataset Name', 'name', 'text', undefined, 'e.g., RefinedWeb', true)}
                {renderField('Slug', 'slug', 'text', undefined, 'e.g., refinedweb', true)}
                {renderField('Provider / Organization', 'provider', 'text', undefined, 'e.g., EleutherAI')}
                {renderField('Dataset Type', 'dataset_type', 'select', ['Text', 'Image', 'Audio', 'Video', 'Multimodal', 'Tabular', 'Time-Series', 'Graph', 'Code'])}
                {renderField('Version', 'version', 'text', undefined, 'e.g., 1.0')}
                {renderField('Release Date', 'release_date', 'date')}
                {renderField('Last Updated', 'last_updated', 'date')}
                {renderField('Status', 'status', 'select', ['draft', 'published', 'archived'])}
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Featured Dataset</label>
                </div>
              </div>
              
              <div>
                {renderField('Short Description', 'description', 'textarea', undefined, 'Brief description...')}
              </div>
              
              <div>
                {renderField('Full Description (Markdown)', 'full_description', 'textarea', undefined, 'Full markdown description...')}
              </div>
            </div>
          )}

          {/* Technical Specifications Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Format', 'format', 'text', undefined, 'e.g., JSON, CSV, Parquet')}
                {renderField('Size', 'size', 'text', undefined, 'e.g., 10GB, 1TB')}
                {renderField('Rows', 'rows', 'number', undefined, 'Number of rows')}
                {renderField('Columns', 'columns', 'number', undefined, 'Number of columns')}
                {renderField('Languages (JSON Array)', 'languages', 'textarea', undefined, '["en", "fr", "de"]')}
                {renderField('Features (JSON Object)', 'features', 'textarea', undefined, '{"text": true, "metadata": true}')}
                {renderField('Split Info (JSON Object)', 'split_info', 'textarea', undefined, '{"train": 80, "test": 20}')}
                {renderField('Preprocessing Info', 'preprocessing_info', 'textarea', undefined, 'Data preprocessing steps...')}
                {renderField('Compression', 'compression', 'text', undefined, 'e.g., gzip, zip')}
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Content & Description</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Domain', 'domain', 'text', undefined, 'e.g., Research, Healthcare')}
                {renderField('Task Types (JSON Array)', 'task_types', 'textarea', undefined, '["classification", "generation"]')}
                {renderField('Categories (JSON Array)', 'categories', 'textarea', undefined, '["nlp", "vision"]')}
                {renderField('Tags (JSON Array)', 'tags', 'textarea', undefined, '["large-scale", "multilingual"]')}
                {renderField('Sample Data (JSON Object)', 'sample_data', 'textarea', undefined, '{"example": "data"}')}
                {renderField('Data Sources', 'data_sources', 'textarea', undefined, 'Where the data came from...')}
              </div>
            </div>
          )}

          {/* Links & Access Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Links & Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Download URL', 'download_url', 'text', undefined, 'https://...')}
                {renderField('HuggingFace URL', 'huggingface_url', 'text', undefined, 'https://huggingface.co/...')}
                {renderField('Kaggle URL', 'kaggle_url', 'text', undefined, 'https://kaggle.com/...')}
                {renderField('GitHub URL', 'github_url', 'text', undefined, 'https://github.com/...')}
                {renderField('Paper URL', 'paper_url', 'text', undefined, 'https://arxiv.org/...')}
                {renderField('Documentation URL', 'documentation_url', 'text', undefined, 'https://...')}
                {renderField('Citation', 'citation', 'textarea', undefined, 'BibTeX citation...')}
                {renderField('DOI', 'doi', 'text', undefined, '10.1234/...')}
              </div>
            </div>
          )}

          {/* Quality & Ethics Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Quality & Ethics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Quality Score', 'quality_score', 'number', undefined, '0-5')}
                {renderField('Collection Method', 'collection_method', 'textarea', undefined, 'How data was collected...')}
                {renderField('Ethical Considerations', 'ethical_considerations', 'textarea', undefined, 'Ethical notes...')}
                {renderField('Bias Notes', 'bias_notes', 'textarea', undefined, 'Known biases...')}
                {renderField('PII Description', 'pii_description', 'textarea', undefined, 'PII information...')}
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="pii_present"
                    checked={formData.pii_present}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">PII Present</label>
                </div>
              </div>
            </div>
          )}

          {/* Media & SEO Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Media & SEO</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Logo URL', 'logo_url', 'text', undefined, 'https://...')}
                {renderField('Featured Image URL', 'featured_image', 'text', undefined, 'https://...')}
                {renderField('SEO Title', 'seo_title', 'text', undefined, 'SEO optimized title')}
                {renderField('SEO Description', 'seo_description', 'textarea', undefined, 'SEO meta description...')}
                {renderField('SEO Keywords', 'seo_keywords', 'text', undefined, 'keyword1, keyword2, keyword3')}
              </div>
            </div>
          )}

          {/* Additional Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Schema JSON', 'schema_json', 'textarea', undefined, '{"field1": "type1"}')}
                {renderField('Changelog', 'changelog', 'textarea', undefined, 'Version history...')}
                {renderField('Accessibility', 'accessibility', 'text', undefined, 'Access requirements...')}
                {renderField('Rating', 'rating', 'number', undefined, '0-5')}
                {renderField('Rating Count', 'rating_count', 'number', undefined, 'Number of ratings')}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border rounded-lg px-6 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
