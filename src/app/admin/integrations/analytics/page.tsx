'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define integration types
interface Integration {
  id: number;
  provider: string;
  type: string;
  name: string;
  status: boolean;
  config: {
    [key: string]: any;
  };
}

export default function AnalyticsIntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/admin/integrations/provider/analytics');
        if (!res.ok) throw new Error('Failed to fetch integrations');
        
        const data = await res.json();
        setIntegrations(data.integrations);
      } catch (error) {
        console.error('Error fetching integrations:', error);
        setStatusMessage({ message: 'Failed to fetch integrations', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, []);

  const handleToggleStatus = async (integration: Integration) => {
    try {
      setSaving(true);
      const updatedIntegration = { ...integration, status: !integration.status };
      
      const res = await fetch(`/api/admin/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedIntegration.status,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update integration');
      
      setIntegrations(prev => 
        prev.map(item => item.id === integration.id ? updatedIntegration : item)
      );
      
      setStatusMessage({ 
        message: `${integration.name} ${updatedIntegration.status ? 'activated' : 'deactivated'} successfully`, 
        type: 'success' 
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error updating integration:', error);
      setStatusMessage({ message: 'Failed to update integration', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async (integration: Integration, configKey: string, value: any) => {
    try {
      setSaving(true);
      const updatedConfig = { ...integration.config, [configKey]: value };
      const updatedIntegration = { ...integration, config: updatedConfig };
      
      const res = await fetch(`/api/admin/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: updatedConfig,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update integration');
      
      setIntegrations(prev => 
        prev.map(item => item.id === integration.id ? updatedIntegration : item)
      );
      
      setStatusMessage({ 
        message: `${integration.name} configuration updated successfully`, 
        type: 'success' 
      });
      
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error updating integration config:', error);
      setStatusMessage({ message: 'Failed to update configuration', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Integrations</h1>
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Integrations</h1>
      </div>
      
      {statusMessage && (
        <div className={`p-4 mb-6 rounded-md ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      <div className="space-y-6">
        {integrations.length === 0 ? (
          <p className="text-gray-500">No analytics integrations found.</p>
        ) : (
          integrations.map(integration => (
            <div key={integration.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{integration.name}</h2>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    integration.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    className={`ml-4 px-4 py-2 rounded-md text-white ${
                      saving ? 'bg-gray-400 cursor-not-allowed' : 
                      integration.status ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    onClick={() => handleToggleStatus(integration)}
                    disabled={saving}
                  >
                    {integration.status ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {integration.type === 'matomo' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matomo URL
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.url || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.url = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="https://analytics.example.com/"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'url', integration.config.url)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Matomo installation URL
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.siteId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.siteId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="1"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'siteId', integration.config.siteId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Matomo site ID
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id={`disable-cookies-${integration.id}`}
                        checked={integration.config.disableCookies || false}
                        onChange={() => handleUpdateConfig(integration, 'disableCookies', !integration.config.disableCookies)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`disable-cookies-${integration.id}`} className="ml-2 block text-sm text-gray-700">
                        Disable cookies tracking
                      </label>
                    </div>
                  </>
                )}
                
                {integration.type === 'plausible' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plausible Domain
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.domain || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.domain = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="yourdomain.com"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'domain', integration.config.domain)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your site domain as configured in Plausible
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plausible Script URL (optional)
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.scriptUrl || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.scriptUrl = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="https://plausible.io/js/script.js"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'scriptUrl', integration.config.scriptUrl)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Optional: custom script URL for self-hosted Plausible
                      </p>
                    </div>
                  </>
                )}
                
                {integration.type === 'fathom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fathom Site ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.siteId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.siteId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="ABCDEF"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'siteId', integration.config.siteId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Fathom site ID
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Domain (optional)
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.customDomain || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.customDomain = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="stats.yourdomain.com"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleUpdateConfig(integration, 'customDomain', integration.config.customDomain)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Optional: custom domain for your Fathom script
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
