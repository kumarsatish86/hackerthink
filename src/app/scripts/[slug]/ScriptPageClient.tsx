'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentsSection from '../../../components/comments/CommentsSection';
import CodeViewer from '@/components/CodeViewer';

interface ScriptVariant {
  id: string;
  language: string;
  script_content: string;
  program_output: string;
  file_extension: string;
}

interface ScriptData {
  id: string;
  title: string;
  slug: string;
  description: string;
  script_content: string;
  program_output: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  is_multi_language: boolean;
  primary_language: string;
  available_languages: string[];
  variants: ScriptVariant[];
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// Interface for related scripts
interface RelatedScript {
  id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  difficulty: string;
  tags: string[];
}

interface ScriptPageClientProps {
  script: ScriptData;
}

export default function ScriptPageClient({ script }: ScriptPageClientProps) {
  const [copied, setCopied] = useState(false);
  const [relatedScripts, setRelatedScripts] = useState<RelatedScript[]>([]);
  const [email, setEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [customFileName, setCustomFileName] = useState<string>('');

  useEffect(() => {
    // Set initial language selection
    if (script.is_multi_language && script.variants && script.variants.length > 0) {
      setSelectedLanguage(script.primary_language || script.variants[0].language);
    } else {
      setSelectedLanguage(script.language);
    }
    
    // Set custom filename
    setCustomFileName(script.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    
    // Fetch related scripts
    fetchRelatedScripts(script);
  }, [script]);

  // Fetch related scripts based on tags or language
  const fetchRelatedScripts = (currentScript: ScriptData) => {
    // Mock data for related scripts
    const mockRelated: RelatedScript[] = [
      {
        id: '1',
        title: 'Network Traffic Monitor',
        slug: 'network-traffic-monitor',
        description: 'A script to monitor network traffic patterns and bandwidth usage',
        language: currentScript.language,
        difficulty: 'Intermediate',
        tags: ['network', 'monitoring', 'bandwidth'],
      },
      {
        id: '2',
        title: 'System Resource Analyzer',
        slug: 'system-resource-analyzer',
        description: 'Analyze system resource usage including CPU, memory, and disk I/O',
        language: currentScript.language,
        difficulty: 'Intermediate',
        tags: ['system', 'resources', 'monitoring'],
      },
      {
        id: '3',
        title: 'Network Security Audit',
        slug: 'network-security-audit',
        description: 'Perform a basic security audit of network configurations and open ports',
        language: currentScript.language,
        difficulty: 'Advanced',
        tags: ['security', 'audit', 'network'],
      },
    ];
    
    setRelatedScripts(mockRelated);
  };
  
  // Function to handle email subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Subscribing ${email} to updates`);
    setSubscribeSuccess(true);
    setEmail('');
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSubscribeSuccess(false);
    }, 3000);
  };

  // Function to generate a clean filename from script title
  const generateFileName = (title: string, language?: string, customName?: string) => {
    // Use custom filename if provided, otherwise generate from title
    let baseName = customName || title;
    
    // Clean the name: remove special characters, convert to lowercase, replace spaces with hyphens
    let cleanTitle = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Add language suffix if provided
    if (language) {
      cleanTitle = `${cleanTitle}-${language.toLowerCase()}`;
    }
    
    return cleanTitle;
  };

  // Function to handle script download
  const handleDownload = (language?: string) => {
    if (!script) return;
    
    let content = script.script_content;
    let fileExtension = getFileExtension(script.language);
    let fileName = generateFileName(script.title, language, customFileName);
    
    // If it's a multi-language script and a specific language is requested
    if (script.is_multi_language && language && script.variants) {
      const variant = script.variants.find(v => v.language === language);
      if (variant) {
        content = variant.script_content;
        fileExtension = variant.file_extension || getFileExtension(language);
        fileName = generateFileName(script.title, language, customFileName);
      }
    }
    
    // Create anchor element with download attribute
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Function to get current script content based on selected language
  const getCurrentScriptContent = () => {
    if (!script) return '';
    
    if (script.is_multi_language && selectedLanguage && script.variants) {
      const variant = script.variants.find(v => v.language === selectedLanguage);
      return variant ? variant.script_content : script.script_content;
    }
    
    return script.script_content;
  };

  // Function to get current program output based on selected language
  const getCurrentProgramOutput = () => {
    if (!script) return '';
    
    if (script.is_multi_language && selectedLanguage && script.variants) {
      const variant = script.variants.find(v => v.language === selectedLanguage);
      return variant ? variant.program_output : script.program_output;
    }
    
    return script.program_output;
  };

  function getFileExtension(language: string): string {
    const extensions: { [key: string]: string } = {
      'bash': 'sh',
      'python': 'py',
      'javascript': 'js',
      'php': 'php',
      'ruby': 'rb',
      'go': 'go',
      'java': 'java',
      'c': 'c',
      'c++': 'cpp',
      'c#': 'cs',
      'powershell': 'ps1',
      'sql': 'sql'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  // Helper function to get icon based on language
  const getLanguageIcon = () => {
    const lang = script.language.toLowerCase();
    if (lang === 'python') {
      return (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path fill="currentColor" d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"/>
        </svg>
      );
    } else if (lang === 'bash' || lang === 'shell') {
      return (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path fill="currentColor" d="M439.8 200.5L419.7 240h-60.4c-9.5 0-17.6 3.8-23.2 11.4s-7.9 16.8-6 27.3l16.2 90h-30l-14-78c-1.4-7.8-5.5-13.9-12.1-18.2s-14.4-5.5-22.5-3.8l-16 3.5l3.8 21.5l16-3.5c3.8-1 6 2 6.6 4.4l14 78c1.4 7.8 5.5 13.9 12.1 18.2s14.4 6 22.5 3.8l30-6.7l3.3 19.5c2.2 11.9-3.5 22.3-14.5 25.7L205 449l4 22.8l140-26.3c9.5-1.9 17.6-6.2 23.2-12.8s8.4-16 7-26.5l-9.5-53l49.9-36.9c11.6-8.2 17.3-19.1 17.3-32.5c0-48.1-10.3-89.3-30.5-123.4zM112 368l-14.5-81.1c-2.2-10.5-8.5-17.8-18.5-22l-32.3-12.9l59.5-25.2c9.5-4 14.8-11.5 15.5-22.4l8.7-120c1.1-10.2-1.9-18.5-8.6-24.9S106.1 48 96 48H80c-8.2 0-15.9 3.5-21.1 9.6s-7.3 14.6-6 22.7l9.3 73.6l-60.2 25.5c-9.5 4-14.7 11.5-15.6 22.3S-9 222.2 2 232l63 56l14.5 81.6c1.9 10.7 8.2 18.2 18.7 22.5l32 12.9l-59 25.5c-9.3 4-14.4 11.6-15.3 22.5c-.4 10.8 3.7 19.1 12.3 24.9s19.6 8 32 6.7l89-9.3l47.1 37.6c8.2 6.6 18.3 9.3 30.1 8c11.8-1.3 20.9-6.9 27.4-16.9l18.7-33.3l-22.5-11.7L272 437.5c-1.5 2.7-5.3 4.8-11.5 5.4s-10.7-1.5-13.5-3.7L200 401.7c-5.5-4.4-12.6-6.4-19.7-5.4L80 408l25.7-11.3c4-1.3 6.4-3.5 7.9-6.5s1.3-7.1-.6-11.2L89.7 278.9c-2.5-5.9-7.3-10.5-13.3-13l-62.4-55.6l33.2-14c4-1.3 6.5-3.6 7.8-6.6s1.3-7.1-.6-11.3L35.5 71h50.6L77.6 188.8c-1.1 5.9 0 12.1 3.2 17.2s8.3 8.8 14.2 10.7l114 45.7c4 1.3 6.5 3.6 7.8 6.6c1.4 3 1.2 7.1-.8 11z"/>
        </svg>
      );
    } else if (lang === 'javascript' || lang === 'js') {
      return (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM243.8 381.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero section with gradient background - Full Width */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-700 text-white shadow-2xl overflow-hidden mb-8">
        <div className="px-8 py-10 backdrop-blur-sm bg-black bg-opacity-10">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6">
              <Link href="/scripts" className="text-indigo-200 hover:text-white inline-flex items-center transition-all duration-200 group">
                <svg className="h-5 w-5 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to all scripts
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    {getLanguageIcon()}
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-white bg-opacity-20 rounded-full">
                      {script.language}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold bg-white bg-opacity-20 rounded-full">
                      {script.difficulty}
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">{script.title}</h1>
                <p className="text-indigo-100 mb-6 max-w-2xl">{script.description}</p>
                
                {script.tags && script.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {script.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500 bg-opacity-40 hover:bg-opacity-60 transition-all duration-200 cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap md:flex-col gap-3 justify-start">
                {/* Language Selector for Multi-Language Scripts */}
                {script.is_multi_language && script.variants && script.variants.length > 0 && (
                  <div className="w-full space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-indigo-100 mb-2">
                        Select Language:
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 border border-indigo-300 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {script.variants.map((variant) => (
                          <option key={variant.language} value={variant.language} className="text-gray-900">
                            {variant.language}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-indigo-100 mb-2">
                        Custom Filename (optional):
                      </label>
                      <input
                        type="text"
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder={`e.g., my-${selectedLanguage.toLowerCase()}-script`}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 border border-indigo-300 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-indigo-200 mt-1">
                        Leave empty to use script title: "{generateFileName(script.title, selectedLanguage)}"
                      </p>
                      <p className="text-xs text-indigo-300 mt-1 font-medium">
                        📁 Will download as: "{generateFileName(script.title, selectedLanguage, customFileName)}.{script.variants?.find(v => v.language === selectedLanguage)?.file_extension || getFileExtension(selectedLanguage)}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Download Buttons */}
                {script.is_multi_language && script.variants && script.variants.length > 0 ? (
                  <div className="w-full space-y-2">
                    <button
                      onClick={() => handleDownload(selectedLanguage)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download {selectedLanguage} Script
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {script.variants.map((variant) => (
                        <button
                          key={variant.language}
                          onClick={() => handleDownload(variant.language)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-indigo-300 text-xs font-medium rounded-md text-white bg-indigo-500 bg-opacity-30 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {variant.language}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-indigo-100 mb-2">
                        Custom Filename (optional):
                      </label>
                      <input
                        type="text"
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder={`e.g., my-${script.language.toLowerCase()}-script`}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 border border-indigo-300 rounded-md text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-indigo-200 mt-1">
                        Leave empty to use script title: "{generateFileName(script.title)}"
                      </p>
                      <p className="text-xs text-indigo-300 mt-1 font-medium">
                        📁 Will download as: "{generateFileName(script.title, undefined, customFileName)}.{getFileExtension(script.language)}"
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDownload()}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Script
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(getCurrentScriptContent());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-500 bg-opacity-30 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  {copied ? (
                    <>
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Script
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Script content with improved styling */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Script Code
            </h2>
            <div className="overflow-hidden rounded-xl">
              <CodeViewer 
                value={getCurrentScriptContent()} 
                language={selectedLanguage || script.language}
              />
            </div>
          </div>
        </div>

        {/* Program output with improved styling */}
        {getCurrentProgramOutput() && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Program Output
              </h2>
              <div className="overflow-hidden rounded-xl">
                <CodeViewer 
                  value={getCurrentProgramOutput()}
                  language="Output" 
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Metadata and author info with improved styling */}
        <div className="bg-gray-50 shadow-md rounded-xl overflow-hidden mb-8 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {script.author_name ? script.author_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Published by {script.author_name || 'Unknown Author'}</p>
                <p className="text-sm text-gray-500">{new Date(script.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {script.os_compatibility && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Compatible with {script.os_compatibility}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {script.script_type}
              </span>
            </div>
          </div>
        </div>
        
        {/* Related scripts section */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Related Scripts
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedScripts.map((related) => (
                <Link key={related.id} href={`/scripts/${related.slug}`}>
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-indigo-50">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{related.title}</h3>
                      <div className="mt-2 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          {related.language}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {related.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-2">{related.description}</p>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {related.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                            #{tag}
                          </span>
                        ))}
                        {related.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{related.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/scripts" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                View all scripts
                <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Comments Section with improved styling */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Comments
            </h2>
          </div>
          <div className="px-6 py-4">
            <CommentsSection contentId={script.id} contentType="script" />
          </div>
        </div>
        
        {/* Subscription form */}
        <div className="bg-indigo-800 shadow-xl rounded-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white max-w-lg">
                <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
                <p className="text-indigo-200">Subscribe to our newsletter to receive updates on new scripts, tutorials, and Linux resources. We'll never spam your inbox!</p>
              </div>
              
              <div className="w-full md:w-auto">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-500 focus:outline-none focus:border-indigo-400"
                    />
                    {subscribeSuccess && (
                      <div className="absolute -bottom-8 left-0 text-green-300 text-sm">
                        Thank you for subscribing!
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200 whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
