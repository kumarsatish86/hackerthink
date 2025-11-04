'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Define integration categories
const integrationCategories = [
  {
    id: 'google',
    name: 'Google Services',
    description: 'Google Analytics, Tag Manager, Search Console, and AdSense',
    icon: (
      <svg
        className="h-10 w-10 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
        />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft Services',
    description: 'Microsoft Clarity analytics and Webmaster tools',
    icon: (
      <svg
        className="h-10 w-10 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
  },
  {
    id: 'ai',
    name: 'AI APIs',
    description: 'OpenAI, Anthropic Claude, DeepSeek, and other AI providers',
    icon: (
      <svg
        className="h-10 w-10 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Various analytics platforms and tracking services',
    icon: (
      <svg
        className="h-10 w-10 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: 'other',
    name: 'Other Services',
    description: 'Social media, third-party widgets, and other integrations',
    icon: (
      <svg
        className="h-10 w-10 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

// Define integration types
interface Integration {
  id: number;
  provider: string;
  type: string;
  name: string;
  status: boolean;
}

export default function IntegrationsPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/admin/integrations');
        if (!res.ok) throw new Error('Failed to fetch integrations');
        
        const data = await res.json();
        
        // Count active integrations by provider
        const counts: Record<string, number> = {};
        data.integrations.forEach((integration: Integration) => {
          if (integration.status) {
            counts[integration.provider] = (counts[integration.provider] || 0) + 1;
          }
        });
        
        setActiveIntegrations(counts);
      } catch (error) {
        console.error('Error fetching integrations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Integrations</h1>
      </div>
      
      <div className="mb-8">
        <p className="text-gray-600">
          Connect your HackerThink website with third-party services and tools to enhance functionality, 
          track analytics, monetize content, and more.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationCategories.map((category) => (
          <Link 
            key={category.id}
            href={`/admin/integrations/${category.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  {category.icon}
                </div>
                {!loading && activeIntegrations[category.id] > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {activeIntegrations[category.id]} active
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600">{category.description}</p>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <span className="text-red-600 font-medium flex items-center">
                Configure
                <svg 
                  className="ml-2 w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
