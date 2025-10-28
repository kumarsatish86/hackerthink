import React, { useState } from 'react';

interface Script {
  id: string;
  title: string;
  description: string;
  script_content: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  featured_image: string;
  is_multi_language: boolean;
  available_languages: string[];
}

interface BulkSEOGeneratorProps {
  scripts: Script[];
  onBulkUpdate: (updates: { [key: string]: { meta_title: string; meta_description: string; tags: string[] } }) => void;
}

export default function BulkSEOGenerator({ scripts, onBulkUpdate }: BulkSEOGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<{ [key: string]: any }>({});

  const analyzeScriptContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const comments = lines.filter(line => 
      line.trim().startsWith('#') || 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*')
    );
    
    const purposeKeywords = {
      'backup': ['backup', 'archive', 'save'],
      'monitoring': ['monitor', 'check', 'status', 'health'],
      'automation': ['automate', 'auto', 'schedule', 'cron'],
      'deployment': ['deploy', 'install', 'setup'],
      'security': ['security', 'secure', 'encrypt', 'protect'],
      'data_processing': ['process', 'parse', 'convert', 'analyze'],
      'system_management': ['system', 'service', 'daemon'],
      'networking': ['network', 'connection', 'port', 'http'],
      'database': ['database', 'db', 'sql', 'query'],
      'file_management': ['file', 'directory', 'copy', 'move']
    };

    const allText = [...comments, content].join(' ').toLowerCase();
    
    for (const [purpose, keywords] of Object.entries(purposeKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return purpose;
      }
    }
    
    return 'utility';
  };

  const generateSEOTitle = (script: Script, purpose: string) => {
    const purposeMap = {
      'backup': 'Backup',
      'monitoring': 'Monitoring',
      'automation': 'Automation',
      'deployment': 'Deployment',
      'security': 'Security',
      'data_processing': 'Data Processing',
      'system_management': 'System Management',
      'networking': 'Networking',
      'database': 'Database',
      'file_management': 'File Management',
      'utility': 'Utility'
    };

    const purposeText = purposeMap[purpose] || 'Utility';
    
    return `${script.title} - ${purposeText} ${script.language} Script | LinuxConcept`;
  };

  const generateSEODescription = (script: Script, purpose: string) => {
    const purposeMap = {
      'backup': 'backup and data protection',
      'monitoring': 'system monitoring and health checks',
      'automation': 'task automation and scheduling',
      'deployment': 'application deployment and configuration',
      'security': 'security and access control',
      'data_processing': 'data processing and analysis',
      'system_management': 'system administration and management',
      'file_management': 'file and directory management',
      'networking': 'network operations and connectivity',
      'database': 'database operations and management',
      'utility': 'system utilities and tools'
    };

    const purposeText = purposeMap[purpose] || 'system utilities';
    const multiLangText = script.is_multi_language ? ` Available in ${script.available_languages.join(', ')}.` : '';
    
    return `Download and use this ${script.difficulty.toLowerCase()} level ${script.language} script for ${purposeText}. Compatible with ${script.os_compatibility}.${multiLangText} Perfect for ${script.script_type.toLowerCase()} tasks.`;
  };

  const generateKeywords = (script: Script, purpose: string) => {
    const baseKeywords = [
      script.language.toLowerCase(),
      script.script_type.toLowerCase(),
      script.os_compatibility.toLowerCase(),
      script.difficulty.toLowerCase(),
      'script',
      'code',
      'programming',
      'linux',
      'automation',
      'devops'
    ];

    const purposeKeywords = {
      'backup': ['backup', 'data protection', 'archive'],
      'monitoring': ['monitoring', 'health check', 'system status'],
      'automation': ['automation', 'scheduling', 'cron'],
      'deployment': ['deployment', 'configuration', 'setup'],
      'security': ['security', 'access control', 'protection'],
      'data_processing': ['data processing', 'analysis', 'transformation'],
      'system_management': ['system administration', 'service management'],
      'file_management': ['file management', 'directory operations'],
      'networking': ['networking', 'connectivity', 'communication'],
      'database': ['database', 'sql', 'data management'],
      'utility': ['utility', 'tool', 'helper']
    };

    const purposeSpecific = purposeKeywords[purpose] || ['utility', 'tool'];
    
    return [...baseKeywords, ...purposeSpecific, ...(script.tags || [])]
      .filter((keyword, index, arr) => arr.indexOf(keyword) === index)
      .slice(0, 10);
  };

  const handleSelectAll = () => {
    if (selectedScripts.length === scripts.length) {
      setSelectedScripts([]);
    } else {
      setSelectedScripts(scripts.map(script => script.id));
    }
  };

  const handleSelectScript = (scriptId: string) => {
    setSelectedScripts(prev => 
      prev.includes(scriptId) 
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleBulkGenerate = async () => {
    if (selectedScripts.length === 0) return;
    
    setIsGenerating(true);
    const updates: { [key: string]: { meta_title: string; meta_description: string; tags: string[] } } = {};
    const newGeneratedData: { [key: string]: any } = {};
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      selectedScripts.forEach(scriptId => {
        const script = scripts.find(s => s.id === scriptId);
        if (script) {
          const purpose = analyzeScriptContent(script.script_content);
          const meta_title = generateSEOTitle(script, purpose);
          const meta_description = generateSEODescription(script, purpose);
          const tags = generateKeywords(script, purpose);
          
          updates[scriptId] = { meta_title, meta_description, tags };
          newGeneratedData[scriptId] = { purpose, meta_title, meta_description, tags };
        }
      });
      
      setGeneratedData(newGeneratedData);
      onBulkUpdate(updates);
    } catch (error) {
      console.error('Error generating bulk SEO:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Bulk SEO Generator
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {selectedScripts.length === scripts.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handleBulkGenerate}
            disabled={isGenerating || selectedScripts.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate SEO ({selectedScripts.length})
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {scripts.map(script => (
          <div key={script.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selectedScripts.includes(script.id)}
              onChange={() => handleSelectScript(script.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {script.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {script.language}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {script.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {script.description || 'No description'}
              </p>
              {generatedData[script.id] && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ SEO generated for {generatedData[script.id].purpose} script
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedScripts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>{selectedScripts.length}</strong> script{selectedScripts.length > 1 ? 's' : ''} selected for SEO generation
          </div>
          <div className="text-xs text-blue-600 mt-1">
            This will generate optimized titles, descriptions, and keywords for all selected scripts
          </div>
        </div>
      )}
    </div>
  );
}
