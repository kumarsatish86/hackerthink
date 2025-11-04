'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBrain, FaSave, FaArrowLeft } from 'react-icons/fa';

export default function CreateModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    developer: '',
    description: '',
    model_type: '',
    parameters: '',
    context_length: '',
    version: '',
    license: '',
    pricing_type: 'free',
    status: 'draft',
    featured: false,
    ideal_hardware: '',
    risk_score: 50,
    comparison_notes: '',
    tutorial_links: [],
    community_links: [],
    research_papers: [],
    alternative_models: [],
    deployment_guide: '',
    cost_estimate: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create model');
      }

      router.push('/admin/content/models');
    } catch (error) {
      console.error('Error creating model:', error);
      alert('Failed to create model');
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaBrain className="text-red-600" />
          Create New AI Model
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Developer</label>
            <input
              type="text"
              name="developer"
              value={formData.developer}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
            <select
              name="model_type"
              value={formData.model_type}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Type</option>
              <option value="LLM">LLM</option>
              <option value="Vision">Vision</option>
              <option value="Audio">Audio</option>
              <option value="Multimodal">Multimodal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parameters</label>
            <input
              type="text"
              name="parameters"
              value={formData.parameters}
              onChange={handleChange}
              placeholder="e.g., 175B, 7B"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context Length</label>
            <input
              type="number"
              name="context_length"
              value={formData.context_length}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
            <input
              type="text"
              name="license"
              value={formData.license}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
            <select
              name="pricing_type"
              value={formData.pricing_type}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="free">Free</option>
              <option value="api_based">API Based</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">Featured</label>
        </div>

        {/* Custom Enrichment Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Enrichment Fields</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ideal Hardware</label>
              <textarea
                name="ideal_hardware"
                value={formData.ideal_hardware}
                onChange={handleChange}
                placeholder="e.g., GPU with 16GB+ VRAM, CUDA 11.0+"
                rows={3}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Score: {formData.risk_score}
              </label>
              <input
                type="range"
                name="risk_score"
                min="0"
                max="100"
                value={formData.risk_score}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low Risk</span>
                <span>Medium Risk</span>
                <span>High Risk</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comparison Notes</label>
              <textarea
                name="comparison_notes"
                value={formData.comparison_notes}
                onChange={handleChange}
                placeholder="Compare with similar models, advantages, limitations..."
                rows={4}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Guide</label>
              <textarea
                name="deployment_guide"
                value={formData.deployment_guide}
                onChange={handleChange}
                placeholder="Step-by-step deployment instructions..."
                rows={6}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {loading ? 'Creating...' : 'Create Model'}
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

