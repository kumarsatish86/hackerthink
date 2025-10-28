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

export default function OtherIntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/admin/integrations/provider/other');
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
        <h1 className="text-2xl font-bold mb-6">Other Integrations</h1>
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Other Integrations</h1>
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
          <p className="text-gray-500">No other integrations found.</p>
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
                {integration.type === 'stripe' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stripe Public Key
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.publicKey || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.publicKey = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="pk_test_..."
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'publicKey', integration.config.publicKey)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Stripe public key
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stripe Secret Key
                      </label>
                      <div className="flex">
                        <input
                          type="password"
                          value={integration.config.secretKey || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.secretKey = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="sk_test_..."
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'secretKey', integration.config.secretKey)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Stripe secret key
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id={`test-mode-${integration.id}`}
                        checked={integration.config.testMode || false}
                        onChange={() => handleUpdateConfig(integration, 'testMode', !integration.config.testMode)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`test-mode-${integration.id}`} className="ml-2 block text-sm text-gray-700">
                        Enable test mode
                      </label>
                    </div>
                  </>
                )}
                
                {integration.type === 'mailchimp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <div className="flex">
                        <input
                          type="password"
                          value={integration.config.apiKey || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.apiKey = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="Enter Mailchimp API key"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'apiKey', integration.config.apiKey)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Mailchimp API key
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        List ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.listId || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.listId = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="abcdef1234"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'listId', integration.config.listId)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Mailchimp list/audience ID
                      </p>
                    </div>
                  </>
                )}
                
                {integration.type === 'slack' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook URL
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.webhookUrl || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.webhookUrl = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="https://hooks.slack.com/services/..."
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'webhookUrl', integration.config.webhookUrl)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your Slack webhook URL
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Channel
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.channel || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.channel = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="#general"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'channel', integration.config.channel)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter the Slack channel name (e.g. #general)
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id={`signup-notifications-${integration.id}`}
                        checked={integration.config.signupNotifications || false}
                        onChange={() => handleUpdateConfig(integration, 'signupNotifications', !integration.config.signupNotifications)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`signup-notifications-${integration.id}`} className="ml-2 block text-sm text-gray-700">
                        Send notifications for new user signups
                      </label>
                    </div>
                  </>
                )}
                
                {integration.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Endpoint
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={integration.config.endpoint || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.endpoint = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="https://api.example.com/webhook"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'endpoint', integration.config.endpoint)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter the custom API endpoint URL
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key/Token
                      </label>
                      <div className="flex">
                        <input
                          type="password"
                          value={integration.config.apiKey || ''}
                          onChange={(e) => {
                            const newIntegration = {...integration};
                            newIntegration.config.apiKey = e.target.value;
                            setIntegrations(prev => 
                              prev.map(item => item.id === integration.id ? newIntegration : item)
                            );
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder="Enter API key or token"
                        />
                        <button
                          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={() => handleUpdateConfig(integration, 'apiKey', integration.config.apiKey)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter the API key or token for authentication
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Headers (JSON)
                      </label>
                      <div className="flex">
                        <textarea
                          value={integration.config.headers ? JSON.stringify(integration.config.headers, null, 2) : ''}
                          onChange={(e) => {
                            try {
                              const newIntegration = {...integration};
                              const headers = e.target.value ? JSON.parse(e.target.value) : {};
                              newIntegration.config.headers = headers;
                              setIntegrations(prev => 
                                prev.map(item => item.id === integration.id ? newIntegration : item)
                              );
                            } catch (err) {
                              // If invalid JSON, don't update
                              console.error('Invalid JSON', err);
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                          placeholder='{"Content-Type": "application/json"}'
                          rows={4}
                        />
                        <button
                          className="ml-2 h-10 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 self-start"
                          onClick={() => handleUpdateConfig(integration, 'headers', integration.config.headers)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter custom HTTP headers in JSON format (optional)
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