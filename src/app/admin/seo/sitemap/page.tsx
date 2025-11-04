'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SitemapSettings {
  generate_sitemap: string;
  sitemap_change_frequency: string;
  sitemap_priority: string;
  include_in_sitemap: string;
}

export default function SitemapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SitemapSettings>({
    generate_sitemap: 'true',
    sitemap_change_frequency: 'weekly',
    sitemap_priority: '0.8',
    include_in_sitemap: 'courses,scripts,articles,tools,lab-exercises,web-stories,commands,tutorials,lessons'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seo/sitemap');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sitemap settings');
      }
      
      const data = await response.json();
      
      if (data.sitemap_settings) {
        setSettings(data.sitemap_settings);
      }
      
      setIsDirty(false);
    } catch (err) {
      console.error('Error fetching sitemap settings:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked ? 'true' : 'false'
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  };

  const handleContentTypeChange = (type: string, checked: boolean) => {
    // Get current included types as array
    const currentTypes = settings.include_in_sitemap.split(',').filter(t => t.trim() !== '');
    
    // Add or remove the type
    let newTypes;
    if (checked) {
      // Add if not already included
      if (!currentTypes.includes(type)) {
        newTypes = [...currentTypes, type];
      } else {
        newTypes = currentTypes;
      }
    } else {
      // Remove if included
      newTypes = currentTypes.filter(t => t !== type);
    }
    
    // Update the setting
    setSettings(prev => ({
      ...prev,
      include_in_sitemap: newTypes.join(',')
    }));
    
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/seo/sitemap', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sitemap_settings: settings }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save sitemap settings');
      }
      
      setSuccess('Sitemap settings saved successfully');
      setIsDirty(false);
    } catch (err) {
      console.error('Error saving sitemap settings:', err);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Check if a content type is included
  const isIncluded = (type: string) => {
    return settings.include_in_sitemap.split(',').includes(type);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sitemap Settings</h1>
          <p className="text-gray-600">Configure your site's XML sitemap for search engines</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={saving || !isDirty}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

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

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center">
                <input
                  id="generate_sitemap"
                  name="generate_sitemap"
                  type="checkbox"
                  checked={settings.generate_sitemap === 'true'}
                  onChange={(e) => handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'generate_sitemap',
                      value: e.target.checked ? 'true' : 'false'
                    }
                  } as any)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="generate_sitemap" className="ml-2 block text-sm text-gray-900">
                  Generate sitemap.xml automatically
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">When enabled, a sitemap.xml file will be generated dynamically based on your content.</p>
            </div>

            <div>
              <label htmlFor="sitemap_change_frequency" className="block text-sm font-medium text-gray-700">
                Default Change Frequency
              </label>
              <select
                id="sitemap_change_frequency"
                name="sitemap_change_frequency"
                value={settings.sitemap_change_frequency}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="always">always</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="never">never</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">How frequently the content on your site is likely to change.</p>
            </div>

            <div>
              <label htmlFor="sitemap_priority" className="block text-sm font-medium text-gray-700">
                Default Priority
              </label>
              <select
                id="sitemap_priority"
                name="sitemap_priority"
                value={settings.sitemap_priority}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="0.1">0.1 (Lowest)</option>
                <option value="0.2">0.2</option>
                <option value="0.3">0.3</option>
                <option value="0.4">0.4</option>
                <option value="0.5">0.5 (Medium)</option>
                <option value="0.6">0.6</option>
                <option value="0.7">0.7</option>
                <option value="0.8">0.8</option>
                <option value="0.9">0.9</option>
                <option value="1.0">1.0 (Highest)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">The priority of URLs relative to other URLs on your site. Values range from 0.0 to 1.0.</p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">Include in Sitemap</span>
              <p className="mt-1 text-sm text-gray-500">Select which content types to include in the sitemap.</p>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_courses"
                      name="include_courses"
                      type="checkbox"
                      checked={isIncluded('courses')}
                      onChange={(e) => handleContentTypeChange('courses', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_courses" className="font-medium text-gray-700">Courses</label>
                    <p className="text-gray-500">Include all published course pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_scripts"
                      name="include_scripts"
                      type="checkbox"
                      checked={isIncluded('scripts')}
                      onChange={(e) => handleContentTypeChange('scripts', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_scripts" className="font-medium text-gray-700">Scripts</label>
                    <p className="text-gray-500">Include all published script pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_articles"
                      name="include_articles"
                      type="checkbox"
                      checked={isIncluded('articles')}
                      onChange={(e) => handleContentTypeChange('articles', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_articles" className="font-medium text-gray-700">Articles</label>
                    <p className="text-gray-500">Include all published article pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_tools"
                      name="include_tools"
                      type="checkbox"
                      checked={isIncluded('tools')}
                      onChange={(e) => handleContentTypeChange('tools', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_tools" className="font-medium text-gray-700">Tools</label>
                    <p className="text-gray-500">Include all published tool pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_lab_exercises"
                      name="include_lab_exercises"
                      type="checkbox"
                      checked={isIncluded('lab-exercises')}
                      onChange={(e) => handleContentTypeChange('lab-exercises', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_lab_exercises" className="font-medium text-gray-700">Lab Exercises</label>
                    <p className="text-gray-500">Include all published lab exercise pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_web_stories"
                      name="include_web_stories"
                      type="checkbox"
                      checked={isIncluded('web-stories')}
                      onChange={(e) => handleContentTypeChange('web-stories', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_web_stories" className="font-medium text-gray-700">Web Stories</label>
                    <p className="text-gray-500">Include all published web story pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_commands"
                      name="include_commands"
                      type="checkbox"
                      checked={isIncluded('commands')}
                      onChange={(e) => handleContentTypeChange('commands', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_commands" className="font-medium text-gray-700">Commands</label>
                    <p className="text-gray-500">Include all published command pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_tutorials"
                      name="include_tutorials"
                      type="checkbox"
                      checked={isIncluded('tutorials')}
                      onChange={(e) => handleContentTypeChange('tutorials', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_tutorials" className="font-medium text-gray-700">Tutorials</label>
                    <p className="text-gray-500">Include all published tutorial pages</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="include_lessons"
                      name="include_lessons"
                      type="checkbox"
                      checked={isIncluded('lessons')}
                      onChange={(e) => handleContentTypeChange('lessons', e.target.checked)}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="include_lessons" className="font-medium text-gray-700">Lessons</label>
                    <p className="text-gray-500">Include all published lesson pages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Public Sitemap URL</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Your XML sitemap is publicly available at the following URL:</p>
          </div>
          <div className="mt-3">
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              View Sitemap
              <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
