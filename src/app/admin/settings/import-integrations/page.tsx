'use client';

import React, { useState, useEffect } from 'react';
import { FaCog, FaCheck, FaTimes, FaKey, FaRedo } from 'react-icons/fa';

interface ImportSetting {
  id: number;
  source_name: string;
  enabled: boolean;
  api_key: string;
  auto_approval: boolean;
  import_limit: number;
  import_interval: string;
  last_sync?: string;
  sync_status?: string;
}

export default function ImportIntegrationsPage() {
  const [settings, setSettings] = useState<ImportSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const sources = [
    {
      name: 'huggingface',
      displayName: 'HuggingFace',
      description: 'Import AI models and datasets from HuggingFace',
      requiresAPIKey: true
    },
    {
      name: 'paperswithcode',
      displayName: 'Papers with Code',
      description: 'Import models from Papers with Code leaderboards',
      requiresAPIKey: false
    },
    {
      name: 'arxiv',
      displayName: 'arXiv',
      description: 'Import models from arXiv research papers',
      requiresAPIKey: true
    },
    {
      name: 'github',
      displayName: 'GitHub',
      description: 'Import models from GitHub repositories',
      requiresAPIKey: true
    }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/import/settings');
      const data = await response.json();
      
      // Initialize default settings for missing sources
      const fetchedSettings = data.settings || [];
      const allSettings = sources.map(source => {
        const existing = fetchedSettings.find((s: ImportSetting) => s.source_name === source.name);
        return existing || {
          source_name: source.name,
          enabled: false,
          api_key: '',
          auto_approval: false,
          import_limit: 10,
          import_interval: 'manual'
        };
      });
      
      setSettings(allSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (sourceName: string, updates: Partial<ImportSetting>) => {
    try {
      const setting = settings.find(s => s.source_name === sourceName);
      const updatedSetting = { ...setting, ...updates } as ImportSetting;

      const response = await fetch('/api/admin/import/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSetting)
      });

      if (!response.ok) throw new Error('Failed to update setting');

      setSettings(settings.map(s => s.source_name === sourceName ? updatedSetting : s));
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Failed to update setting');
    }
  };

  const toggleEnabled = (sourceName: string) => {
    const setting = settings.find(s => s.source_name === sourceName);
    updateSetting(sourceName, { enabled: !setting?.enabled });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaCog className="text-red-600" />
          Import Integrations
        </h1>
        <p className="text-gray-600 mt-2">Configure automatic imports from external sources</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {sources.map(source => {
            const setting = settings.find(s => s.source_name === source.name);
            return (
              <div key={source.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{source.displayName}</h3>
                    <p className="text-sm text-gray-600">{source.description}</p>
                  </div>
                  <button
                    onClick={() => toggleEnabled(source.name)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      setting?.enabled
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {setting?.enabled ? <FaCheck /> : <FaTimes />}
                    {setting?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {setting?.enabled && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    {source.requiresAPIKey && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaKey /> API Key
                        </label>
                        <input
                          type="password"
                          value={setting.api_key || ''}
                          onChange={(e) => updateSetting(source.name, { api_key: e.target.value })}
                          placeholder="Enter API key"
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Import Limit</label>
                        <input
                          type="number"
                          value={setting?.import_limit || 10}
                          onChange={(e) => updateSetting(source.name, { import_limit: parseInt(e.target.value) })}
                          className="w-full border rounded px-3 py-2"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Import Interval</label>
                        <select
                          value={setting?.import_interval || 'manual'}
                          onChange={(e) => updateSetting(source.name, { import_interval: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="manual">Manual</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`auto-approval-${source.name}`}
                        checked={setting?.auto_approval || false}
                        onChange={(e) => updateSetting(source.name, { auto_approval: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor={`auto-approval-${source.name}`} className="text-sm text-gray-700">
                        Auto-approve imported items
                      </label>
                    </div>

                    {setting?.last_sync && (
                      <div className="text-xs text-gray-500">
                        Last sync: {new Date(setting.last_sync).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

