'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Redirect {
  id: string;
  source_url: string;
  target_url: string;
  redirect_type: number;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function RedirectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    redirect_type: 301,
    is_active: true,
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [refreshingCache, setRefreshingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchRedirects();
    }
  }, [status, router]);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seo/redirects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch redirects');
      }
      
      const data = await response.json();
      setRedirects(data.redirects || []);
    } catch (err) {
      console.error('Error fetching redirects:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value) 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    
    try {
      // Validate form
      if (!formData.source_url) {
        throw new Error('Source URL is required');
      }
      
      if (!formData.target_url) {
        throw new Error('Target URL is required');
      }
      
      // Submit form
      const response = await fetch('/api/admin/seo/redirects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create redirect');
      }
      
      // Reset form and refresh data
      setFormData({
        source_url: '',
        target_url: '',
        redirect_type: 301,
        is_active: true,
        notes: ''
      });
      setShowForm(false);
      await fetchRedirects();
    } catch (err) {
      console.error('Error creating redirect:', err);
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/seo/redirects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete redirect');
      }
      
      setDeleteConfirm(null);
      await fetchRedirects();
    } catch (err) {
      console.error('Error deleting redirect:', err);
      setError((err as Error).message);
    }
  };

  const handleToggleActive = async (id: string, currently: boolean) => {
    try {
      const response = await fetch(`/api/admin/seo/redirects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currently }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update redirect');
      }
      
      await fetchRedirects();
    } catch (err) {
      console.error('Error updating redirect:', err);
      setError((err as Error).message);
    }
  };

  const handleRefreshCache = async () => {
    try {
      setRefreshingCache(true);
      setCacheMessage(null);
      
      const response = await fetch('/api/admin/seo/redirects/refresh-cache', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh cache');
      }
      
      const data = await response.json();
      setCacheMessage(`Cache refreshed successfully with ${data.count} redirects`);
    } catch (err) {
      console.error('Error refreshing cache:', err);
      setCacheMessage(`Error: ${(err as Error).message}`);
    } finally {
      setRefreshingCache(false);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">URL Redirects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage redirects from old URLs to new destinations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            type="button"
            onClick={() => fetchRedirects()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh List
          </button>
          <button
            type="button"
            onClick={handleRefreshCache}
            disabled={refreshingCache}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {refreshingCache ? 'Refreshing...' : 'Refresh Cache'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showForm ? 'Cancel' : 'Add Redirect'}
          </button>
        </div>
      </div>

      {cacheMessage && (
        <div className={`mt-4 p-4 rounded-md ${cacheMessage.startsWith('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {cacheMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Redirect</h2>
          
          {formError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="source_url" className="block text-sm font-medium text-gray-700">
                  Source URL <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="source_url"
                    id="source_url"
                    value={formData.source_url}
                    onChange={handleInputChange}
                    placeholder="/old-page or old-page (without domain)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">The URL path that should be redirected (e.g., /old-url)</p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="target_url" className="block text-sm font-medium text-gray-700">
                  Target URL <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="target_url"
                    id="target_url"
                    value={formData.target_url}
                    onChange={handleInputChange}
                    placeholder="/new-page or https://example.com/page"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">The destination URL (can be internal or external)</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="redirect_type" className="block text-sm font-medium text-gray-700">
                  Redirect Type
                </label>
                <div className="mt-1">
                  <select
                    id="redirect_type"
                    name="redirect_type"
                    value={formData.redirect_type}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value={301}>301 - Permanent</option>
                    <option value={302}>302 - Temporary</option>
                    <option value={307}>307 - Temporary (Strict)</option>
                    <option value={308}>308 - Permanent (Strict)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center h-full mt-6">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Optional notes about this redirect"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Redirect'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {redirects.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {redirects.map((redirect) => (
              <li key={redirect.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          redirect.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {redirect.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span 
                        className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {redirect.redirect_type === 301 ? '301 Permanent' : 
                         redirect.redirect_type === 302 ? '302 Temporary' :
                         redirect.redirect_type === 307 ? '307 Temporary (Strict)' :
                         redirect.redirect_type === 308 ? '308 Permanent (Strict)' :
                         `${redirect.redirect_type}`}
                      </span>
                    </div>
                    
                    <div className="sm:flex sm:items-center sm:space-x-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {redirect.source_url}
                      </p>
                      <div className="hidden sm:flex items-center text-gray-500">
                        <svg className="h-5 w-5 mx-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-indigo-600 truncate">
                        {redirect.target_url}
                      </p>
                    </div>
                    
                    {redirect.notes && (
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {redirect.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(redirect.id, redirect.is_active)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                        redirect.is_active ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-green-700 bg-green-100 hover:bg-green-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {redirect.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {deleteConfirm === redirect.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(redirect.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(redirect.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No redirects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new redirect.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Redirect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 