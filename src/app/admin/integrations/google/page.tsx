'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
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

export default function GoogleIntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/admin/integrations/provider/google');
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
        <h1 className="text-2xl font-bold mb-6">Google Integrations</h1>
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Google Integrations</h1>
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
          <p className="text-gray-500">No Google integrations found.</p>
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
                {integration.type === 'analytics' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Analytics Tracking ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.trackingId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.trackingId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'trackingId', integration.config.trackingId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Google Analytics tracking ID (starts with UA- or G-)
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id={`anonymize-ip-${integration.id}`}
                        checked={integration.config.anonymizeIp || false}
                        onChange={() => handleUpdateConfig(integration, 'anonymizeIp', !integration.config.anonymizeIp)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`anonymize-ip-${integration.id}`} className="ml-2 block text-sm text-gray-700">
                        Anonymize IP addresses
                      </label>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={`send-pageviews-${integration.id}`}
                        checked={integration.config.sendPageViews || false}
                        onChange={() => handleUpdateConfig(integration, 'sendPageViews', !integration.config.sendPageViews)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`send-pageviews-${integration.id}`} className="ml-2 block text-sm text-gray-700">
                        Automatically send page views
                      </label>
                    </div>
                  </>
                )}
                
                {integration.type === 'tagmanager' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Container ID
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={integration.config.containerId || ''}
                        onChange={(e) => {
                          const newIntegration = {...integration};
                          newIntegration.config.containerId = e.target.value;
                          setIntegrations(prev => 
                            prev.map(item => item.id === integration.id ? newIntegration : item)
                          );
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="GTM-XXXXXXX"
                      />
                      <button
                        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        onClick={() => handleUpdateConfig(integration, 'containerId', integration.config.containerId)}
                        disabled={saving}
                      >
                        Save
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your Google Tag Manager container ID (starts with GTM-)
                    </p>
                  </div>
                )}
                
                {integration.type === 'search_console' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={integration.config.verificationCode || ''}
                        onChange={(e) => {
                          const newIntegration = {...integration};
                          newIntegration.config.verificationCode = e.target.value;
                          setIntegrations(prev => 
                            prev.map(item => item.id === integration.id ? newIntegration : item)
                          );
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="<meta name='google-site-verification' content='XXXXX'>"
                      />
                      <button
                        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        onClick={() => handleUpdateConfig(integration, 'verificationCode', integration.config.verificationCode)}
                        disabled={saving}
                      >
                        Save
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the verification meta tag or code provided by Google Search Console
                    </p>
                  </div>
                )}
                
                {integration.type === 'adsense' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.clientId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.clientId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="ca-pub-XXXXXXXXXX"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'clientId', integration.config.clientId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Google AdSense client ID (starts with ca-pub-)
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Slot ID (optional)
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.slotId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.slotId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="XXXXXXXXXX"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'slotId', integration.config.slotId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your default Ad Slot ID (optional)
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