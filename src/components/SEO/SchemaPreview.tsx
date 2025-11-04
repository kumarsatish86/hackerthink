import React, { useState } from 'react';

interface SchemaPreviewProps {
  scriptData: {
    title: string;
    description: string;
    script_type: string;
    language: string;
    os_compatibility: string;
    difficulty: string;
    tags: string[];
    is_multi_language: boolean;
    available_languages: string[];
    meta_title?: string;
    meta_description?: string;
  };
}

export default function SchemaPreview({ scriptData }: SchemaPreviewProps) {
  const [activeTab, setActiveTab] = useState('software');

  const generateSoftwareApplicationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": scriptData.meta_title || scriptData.title,
      "description": scriptData.meta_description || scriptData.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": scriptData.os_compatibility,
      "programmingLanguage": scriptData.language,
      "softwareVersion": "1.0.0",
      "datePublished": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "HackerThink"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `https://ainews.com/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
      },
      "keywords": scriptData.tags?.join(', ') || '',
      "isAccessibleForFree": true,
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareRequirements": scriptData.os_compatibility,
      "fileSize": "Unknown",
      "downloadUrl": `https://ainews.com/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}/download`,
      "screenshot": "https://ainews.com/images/script-screenshot.png"
    };
  };

  const generateHowToSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to use ${scriptData.title}`,
      "description": scriptData.description,
      "image": "https://ainews.com/images/script-tutorial.png",
      "totalTime": "PT10M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Computer with Linux/Unix system"
        },
        {
          "@type": "HowToSupply", 
          "name": "Terminal access"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": "Text editor"
        },
        {
          "@type": "HowToTool",
          "name": "Terminal/Command line"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Download the script",
          "text": "Download the script file to your system",
          "url": `https://ainews.com/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}/download`
        },
        {
          "@type": "HowToStep",
          "name": "Make executable",
          "text": "Make the script executable using chmod +x command"
        },
        {
          "@type": "HowToStep",
          "name": "Run the script",
          "text": "Execute the script with appropriate parameters"
        }
      ]
    };
  };

  const generateBreadcrumbSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://ainews.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Scripts",
          "item": "https://ainews.com/scripts"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": scriptData.title,
          "item": `https://ainews.com/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
        }
      ]
    };
  };

  const generateCollectionPageSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${scriptData.language} Scripts Collection`,
      "description": `Collection of ${scriptData.language} scripts for ${scriptData.script_type.toLowerCase()}`,
      "url": "https://ainews.com/scripts",
      "mainEntity": {
        "@type": "ItemList",
        "name": `${scriptData.language} Scripts`,
        "description": `A curated collection of ${scriptData.language} scripts`,
        "numberOfItems": "50+",
        "itemListElement": [
          {
            "@type": "SoftwareApplication",
            "name": scriptData.title,
            "description": scriptData.description,
            "url": `https://ainews.com/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
          }
        ]
      }
    };
  };

  const getSchemaByType = (type: string) => {
    switch (type) {
      case 'software':
        return generateSoftwareApplicationSchema();
      case 'howto':
        return generateHowToSchema();
      case 'breadcrumb':
        return generateBreadcrumbSchema();
      case 'collection':
        return generateCollectionPageSchema();
      default:
        return generateSoftwareApplicationSchema();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const tabs = [
    { id: 'software', name: 'SoftwareApplication', icon: '💻' },
    { id: 'howto', name: 'HowTo', icon: '📋' },
    { id: 'breadcrumb', name: 'BreadcrumbList', icon: '🍞' },
    { id: 'collection', name: 'CollectionPage', icon: '📚' }
  ];

  const currentSchema = getSchemaByType(activeTab);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Schema Structure Preview
        </h3>
        <button
          onClick={() => copyToClipboard(JSON.stringify(currentSchema, null, 2))}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy JSON
        </button>
      </div>

      {/* Schema Type Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-1 text-xs">{tab.icon}</span>
              <span className="text-xs">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Schema JSON Display */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            {tabs.find(t => t.id === activeTab)?.name} Schema
          </h4>
          <span className="text-xs text-gray-500">
            {Object.keys(currentSchema).length} properties
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(currentSchema, null, 2)}
          </pre>
        </div>
      </div>

      {/* Validation Links */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Validate Schema:</h5>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(`http://localhost:3007/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
          >
            🔍 Google Rich Results
          </a>
          <a
            href={`https://validator.schema.org/?url=${encodeURIComponent(`http://localhost:3007/scripts/${scriptData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
          >
            ✅ Schema.org Validator
          </a>
        </div>
      </div>
    </div>
  );
}
