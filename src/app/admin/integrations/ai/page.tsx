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
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export default function AIIntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        // Filter AI providers
        const providers = ['openai', 'anthropic', 'deepseek'];
        const queries = providers.map(provider => 
          fetch(`/api/admin/integrations/provider/${provider}`).then(res => res.json())
        );
        
        const results = await Promise.all(queries);
        let allIntegrations: Integration[] = [];
        
        results.forEach(result => {
          if (result.integrations) {
            allIntegrations = [...allIntegrations, ...result.integrations];
          }
        });
        
        setIntegrations(allIntegrations);
      } catch (error) {
        console.error('Error fetching AI integrations:', error);
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
  
  // Model options for each provider
  const modelOptions = {
    openai: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
    anthropic: [
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    ],
    deepseek: [
      { value: 'deepseek-coder', label: 'DeepSeek Coder' },
      { value: 'deepseek-llm', label: 'DeepSeek LLM' },
    ],
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">AI API Integrations</h1>
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI API Integrations</h1>
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
          <p className="text-gray-500">No AI API integrations found.</p>
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
                      placeholder="Enter API key here"
                    />
                    <button
                      className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      onClick={() => handleUpdateConfig(integration, 'apiKey', integration.config.apiKey)}
                      disabled={saving}
                    >
                      Save
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Your API key is stored securely and never shared with third parties
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Model
                  </label>
                  <div className="flex">
                    <select
                      value={integration.config.model || ''}
                      onChange={(e) => {
                        const newIntegration = {...integration};
                        newIntegration.config.model = e.target.value;
                        setIntegrations(prev => 
                          prev.map(item => item.id === integration.id ? newIntegration : item)
                        );
                        handleUpdateConfig(integration, 'model', e.target.value);
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a model</option>
                      {modelOptions[integration.provider as keyof typeof modelOptions]?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={integration.config.temperature || 0.7}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          const newIntegration = {...integration};
                          newIntegration.config.temperature = value;
                          setIntegrations(prev => 
                            prev.map(item => item.id === integration.id ? newIntegration : item)
                          );
                          handleUpdateConfig(integration, 'temperature', value);
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <span className="ml-2 text-gray-900 w-12 text-center">
                        {integration.config.temperature || 0.7}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Controls randomness (0 = deterministic, 1 = creative)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        step="100"
                        value={integration.config.maxTokens || 1000}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const newIntegration = {...integration};
                          newIntegration.config.maxTokens = value;
                          setIntegrations(prev => 
                            prev.map(item => item.id === integration.id ? newIntegration : item)
                          );
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={() => handleUpdateConfig(integration, 'maxTokens', integration.config.maxTokens)}
                        disabled={saving}
                      >
                        Save
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum length of generated content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
