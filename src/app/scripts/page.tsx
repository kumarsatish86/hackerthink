'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Script {
  id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  script_type: string;
  difficulty: string;
  tags: string[];
  author_id?: string;
  category?: string;
  created_at: string;
  downloads?: number;
  rating?: number;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState('all'); 
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Featured script categories with descriptions
  const scriptCollections = [
    {
      title: 'Automation Scripts',
      description: 'Save time with scripts that automate repetitive tasks',
      icon: '🤖',
      category: 'automation'
    },
    {
      title: 'System Monitoring',
      description: 'Keep your systems healthy with monitoring scripts',
      icon: '📊',
      category: 'monitoring'
    },
    {
      title: 'Security Tools',
      description: 'Enhance your system security with these scripts',
      icon: '🔒',
      category: 'security'
    }
  ];
  
  // Popular language tags
  const popularLanguages = ['bash', 'python', 'perl', 'javascript', 'sql'];

  useEffect(() => {
    // Fetch scripts from the API
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/scripts');
        
        if (!response.ok) {
          throw new Error('Failed to load scripts');
        }
        
        const data = await response.json();
        
        if (data.scripts && Array.isArray(data.scripts)) {
          // Transform data to match the expected format
          const formattedScripts = data.scripts.map((script: any) => ({
            ...script,
            // Map script_type to category for filtering
            category: script.script_type ? script.script_type.toLowerCase().replace(/\s+/g, '-') : 'other',
            // Default values for missing fields
            downloads: Math.floor(Math.random() * 1500) + 100, // Random download count for UI
            rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
            // Convert tags to lowercase for filtering if they exist
            tags: Array.isArray(script.tags) ? script.tags.map((tag: string) => tag.toLowerCase()) : []
          }));
          setScripts(formattedScripts);
        } else {
          setScripts([]);
        }
      } catch (err) {
        console.error('Error fetching scripts:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const languages = [
    { id: 'all', name: 'All Languages' },
    { id: 'bash', name: 'Bash' },
    { id: 'python', name: 'Python' },
    { id: 'perl', name: 'Perl' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'sql', name: 'SQL' }
  ];
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'system-administration', name: 'System Administration' },
    { id: 'backup', name: 'Backup & Recovery' },
    { id: 'security', name: 'Security' },
    { id: 'monitoring', name: 'Monitoring' },
    { id: 'database', name: 'Database' },
    { id: 'file-management', name: 'File Management' },
    { id: 'cloud-computing', name: 'Cloud Computing' },
    { id: 'containers', name: 'Containers' }
  ];
  
  const filteredScripts = scripts.filter(script => {
    // Apply language filter
    if (languageFilter !== 'all' && script.language && script.language.toLowerCase() !== languageFilter) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && script.category !== categoryFilter) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        script.title.toLowerCase().includes(query) ||
        (script.description && script.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Format date string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get appropriate color for language tag
  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      bash: 'bg-green-100 text-green-800',
      python: 'bg-blue-100 text-blue-800',
      perl: 'bg-purple-100 text-purple-800',
      javascript: 'bg-yellow-100 text-yellow-800',
      sql: 'bg-pink-100 text-pink-800'
    };

    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-white"></div>
          <p className="mt-4 text-white text-lg">Loading scripts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-600 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Scripts</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Animated code symbols */}
            {['$', '#', '>', '{', '}', '()', '&&', '||', '#!/bin/bash', 'function', 'echo'].map((symbol, index) => (
              <div 
                key={index}
                className="absolute text-white text-opacity-10 font-mono"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 24 + 12}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
              >
                {symbol}
              </div>
            ))}
          </div>
      </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="space-y-8">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-800 bg-opacity-50 text-indigo-100">
                    <span className="animate-pulse mr-1">●</span> Linux Automation
                  </span>
                  <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                    <span className="block">Powerful Scripts</span>
                    <span className="block text-indigo-200">For Linux Experts</span>
                  </h1>
                </div>
                <p className="mt-3 text-xl text-indigo-100 max-w-3xl leading-relaxed">
                  Browse our curated collection of powerful shell scripts, automation tools, and system utilities designed for Linux administrators, developers, and power users.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <a
                    href="#scripts"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                    Browse Scripts
                  </a>
                  <a
                    href="/contribute-script"
                    className="inline-flex items-center px-6 py-3 border border-indigo-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-indigo-700 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
                    Contribute Script
                  </a>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="border-t-2 border-indigo-400 pt-4">
                  <p className="text-4xl font-extrabold text-white">{scripts.length}+</p>
                  <p className="text-indigo-200 text-sm">Ready-to-Use Scripts</p>
                </div>
                <div className="border-t-2 border-indigo-400 pt-4">
                  <p className="text-4xl font-extrabold text-white">5+</p>
                  <p className="text-indigo-200 text-sm">Programming Languages</p>
                </div>
                <div className="border-t-2 border-indigo-400 pt-4">
                  <p className="text-4xl font-extrabold text-white">100%</p>
                  <p className="text-indigo-200 text-sm">Open Source</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-none lg:px-0">
                <div className="relative overflow-hidden rounded-xl shadow-2xl transform transition-all hover:-translate-y-2 duration-300">
                  {/* Terminal header */}
                  <div className="bg-gray-900 rounded-t-xl p-2 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-2 text-gray-400 text-sm font-mono">bash ~ linux-scripts</div>
                  </div>
                  
                  {/* Terminal content with typewriter effect */}
                  <div className="bg-gray-800 p-4 font-mono text-sm text-green-400 h-80 overflow-hidden">
                    <div className="animate-typing overflow-hidden whitespace-pre border-r-2 border-r-white pr-5 w-fit">
                      <p>$ <span className="text-blue-300">cat</span> welcome.sh</p>
                      <p className="text-gray-500"># Welcome to Linux Scripts Library</p>
                      <p className="text-gray-500"># Find the perfect script for your needs</p>
                      <p></p>
                      <p><span className="text-yellow-300">#!/bin/bash</span></p>
                      <p></p>
                      <p><span className="text-purple-400">function</span> <span className="text-blue-300">welcome</span>() {'{'}</p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"Welcome to the Linux Scripts Library!"</span></p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"Find scripts for:"</span></p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"- System Administration"</span></p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"- Automation Tasks"</span></p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"- Security Hardening"</span></p>
                      <p>  <span className="text-yellow-300">echo</span> <span className="text-green-300">"- Performance Monitoring"</span></p>
                      <p>{'}'}</p>
                      <p></p>
                      <p>welcome</p>
                      <p>$ _</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider with floating elements */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute w-full bottom-16 z-10 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 relative h-24">
              {/* Floating code symbols */}
              {['{', '}', '()', '=>', '&&', '||', '*', '#'].map((symbol, index) => (
                <div 
                  key={index}
                  className="absolute text-indigo-200 font-mono opacity-70 animate-float"
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    bottom: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 16 + 14}px`,
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: `${Math.random() * 5 + 10}s`,
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 w-full z-5" 
            style={{ 
              height: '120px', 
              background: 'linear-gradient(to bottom, rgba(79, 70, 229, 0) 0%, rgba(79, 70, 229, 0.1) 100%)'
            }}
          />
          
          {/* Multi-wave effect */}
          <div className="relative" style={{ height: '150px' }}>
            {/* First wave - slight transparency */}
            <svg 
              className="absolute bottom-0 left-0 right-0 w-full"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 320" 
              preserveAspectRatio="none"
              style={{ height: '150px' }}
            >
              <path 
                fill="rgba(249, 250, 251, 0.7)" 
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,192C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
            
            {/* Second wave - full color */}
            <svg 
              className="absolute bottom-0 left-0 right-0 w-full" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 320" 
              preserveAspectRatio="none"
              style={{ height: '120px' }}
            >
              <path 
                fill="#f9fafb" 
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,181.3C672,171,768,181,864,186.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
            
            {/* Decorative dots on the wave */}
            <div className="absolute bottom-0 left-0 right-0 w-full h-16 z-10">
              <div className="max-w-7xl mx-auto px-4 relative">
                {[...Array(8)].map((_, index) => (
                  <div 
                    key={index}
                    className="absolute rounded-full bg-indigo-100 opacity-40"
                    style={{
                      left: `${Math.random() * 90 + 5}%`,
                      bottom: `${Math.random() * 80}%`,
                      width: `${Math.random() * 30 + 5}px`,
                      height: `${Math.random() * 30 + 5}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Scripts Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">Featured Scripts</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Our most popular and powerful automation scripts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {scripts.slice(0, 3).map((script) => (
              <div 
                key={script.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform transition duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
              >
                <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(script.language)}`}>
                      {script.language}
                    </span>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm text-gray-600">Featured</span>
                </div>
                  </div>
                  <Link href={`/scripts/${script.slug}`}>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 hover:text-indigo-600 transition duration-150">
                      {script.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {script.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {script.tags && script.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-indigo-50 text-indigo-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-600">{script.difficulty || 'Beginner'}</span>
                  </div>
                  <Link href={`/scripts/${script.slug}`} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    View Details
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="#scripts" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              View All Scripts
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Collections */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Script Collections
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-center text-xl text-gray-500 sm:mt-4">
            Explore our curated collections of powerful scripts
          </p>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {scriptCollections.map((collection, index) => (
              <div 
                key={index}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-4xl mb-4">{collection.icon}</div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {collection.description}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => setCategoryFilter(collection.category)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Scripts
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Language Tags */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Languages</h2>
          <div className="flex flex-wrap gap-3">
            {popularLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang === languageFilter ? 'all' : lang)}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  languageFilter === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } transition-colors duration-200`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
            {languageFilter !== 'all' && (
              <button
                onClick={() => setLanguageFilter('all')}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Why Use Scripts Section */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Why Use Scripts?</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-indigo-200">
              The power of automation in your hands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg border border-white border-opacity-10 hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Efficiency</h3>
              <p className="mt-2 text-indigo-200">
                Automate repetitive tasks and save hours of manual work every week
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg border border-white border-opacity-10 hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Consistency</h3>
              <p className="mt-2 text-indigo-200">
                Ensure tasks are performed the same way every time, eliminating human error
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg border border-white border-opacity-10 hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Documentation</h3>
              <p className="mt-2 text-indigo-200">
                Scripts serve as living documentation of your system processes
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg border border-white border-opacity-10 hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Scalability</h3>
              <p className="mt-2 text-indigo-200">
                Run the same script once or a thousand times with perfect repeatability
              </p>
            </div>
          </div>

          <div className="mt-16 bg-black bg-opacity-30 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-2">Learn, Share, Collaborate</h3>
                <p className="text-indigo-200">
                  Our scripts library is more than just code—it's a community of Linux enthusiasts helping each other automate and solve complex problems. Share your expertise by contributing your scripts or learn from others by exploring our collection.
                </p>
                <div className="mt-4">
                  <Link href="/contribute-script" className="inline-flex items-center text-indigo-300 hover:text-white">
                    Join the community
                    <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="text-center">
                  <div className="flex justify-center space-x-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{Math.floor(scripts.length * 1.5)}+</p>
                      <p className="text-indigo-300 text-sm">Weekly Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{Math.floor(scripts.length / 2)}+</p>
                      <p className="text-indigo-300 text-sm">Contributors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Real experiences from Linux enthusiasts and professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100 relative">
              <div className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
                  <path d="M12.8334 20H7.50008C7.04175 20 6.66675 19.625 6.66675 19.1667V14.1667C6.66675 10.9833 9.25008 8.33333 12.5001 8.33333H13.3334C13.7917 8.33333 14.1667 8.70833 14.1667 9.16667V12.5C14.1667 12.9583 13.7917 13.3333 13.3334 13.3333H12.5001C11.5834 13.3333 10.8334 14.0833 10.8334 15V15.8333C10.8334 16.2917 11.2084 16.6667 11.6667 16.6667H12.8334C16.1501 16.6667 18.8334 19.35 18.8334 22.6667V26.6667C18.8334 30.0167 16.1834 32.6667 12.8334 32.6667H7.50008C7.04175 32.6667 6.66675 32.2917 6.66675 31.8333V27.5C6.66675 27.0417 7.04175 26.6667 7.50008 26.6667H12.8334C13.7501 26.6667 14.5001 25.9167 14.5001 25V24.1667C14.5001 23.25 13.7501 22.5 12.8334 22.5H10.0001C8.15841 22.5 6.66675 20.9833 6.66675 19.1667C6.66675 19.625 6.66675 20 6.66675 20" fill="currentColor" />
                  <path d="M32.8334 20H27.5001C27.0417 20 26.6667 19.625 26.6667 19.1667V14.1667C26.6667 10.9833 29.2501 8.33333 32.5001 8.33333H33.3334C33.7917 8.33333 34.1667 8.70833 34.1667 9.16667V12.5C34.1667 12.9583 33.7917 13.3333 33.3334 13.3333H32.5001C31.5834 13.3333 30.8334 14.0833 30.8334 15V15.8333C30.8334 16.2917 31.2084 16.6667 31.6667 16.6667H32.8334C36.1501 16.6667 38.8334 19.35 38.8334 22.6667V26.6667C38.8334 30.0167 36.1834 32.6667 32.8334 32.6667H27.5001C27.0417 32.6667 26.6667 32.2917 26.6667 31.8333V27.5C26.6667 27.0417 27.0417 26.6667 27.5001 26.6667H32.8334C33.7501 26.6667 34.5001 25.9167 34.5001 25V24.1667C34.5001 23.25 33.7501 22.5 32.8334 22.5H30.0001C28.1584 22.5 26.6667 20.9833 26.6667 19.1667C26.6667 19.625 26.6667 20 26.6667 20" fill="currentColor" />
                </svg>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "The backup scripts I found here saved me countless hours of work. They're well-documented and easy to customize for my specific needs."
                </p>
                <div className="flex items-center mt-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      JS
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">John Smith</h4>
                    <p className="text-sm text-gray-500">System Administrator</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100 relative">
              <div className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
                  <path d="M12.8334 20H7.50008C7.04175 20 6.66675 19.625 6.66675 19.1667V14.1667C6.66675 10.9833 9.25008 8.33333 12.5001 8.33333H13.3334C13.7917 8.33333 14.1667 8.70833 14.1667 9.16667V12.5C14.1667 12.9583 13.7917 13.3333 13.3334 13.3333H12.5001C11.5834 13.3333 10.8334 14.0833 10.8334 15V15.8333C10.8334 16.2917 11.2084 16.6667 11.6667 16.6667H12.8334C16.1501 16.6667 18.8334 19.35 18.8334 22.6667V26.6667C18.8334 30.0167 16.1834 32.6667 12.8334 32.6667H7.50008C7.04175 32.6667 6.66675 32.2917 6.66675 31.8333V27.5C6.66675 27.0417 7.04175 26.6667 7.50008 26.6667H12.8334C13.7501 26.6667 14.5001 25.9167 14.5001 25V24.1667C14.5001 23.25 13.7501 22.5 12.8334 22.5H10.0001C8.15841 22.5 6.66675 20.9833 6.66675 19.1667C6.66675 19.625 6.66675 20 6.66675 20" fill="currentColor" />
                  <path d="M32.8334 20H27.5001C27.0417 20 26.6667 19.625 26.6667 19.1667V14.1667C26.6667 10.9833 29.2501 8.33333 32.5001 8.33333H33.3334C33.7917 8.33333 34.1667 8.70833 34.1667 9.16667V12.5C34.1667 12.9583 33.7917 13.3333 33.3334 13.3333H32.5001C31.5834 13.3333 30.8334 14.0833 30.8334 15V15.8333C30.8334 16.2917 31.2084 16.6667 31.6667 16.6667H32.8334C36.1501 16.6667 38.8334 19.35 38.8334 22.6667V26.6667C38.8334 30.0167 36.1834 32.6667 32.8334 32.6667H27.5001C27.0417 32.6667 26.6667 32.2917 26.6667 31.8333V27.5C26.6667 27.0417 27.0417 26.6667 27.5001 26.6667H32.8334C33.7501 26.6667 34.5001 25.9167 34.5001 25V24.1667C34.5001 23.25 33.7501 22.5 32.8334 22.5H30.0001C28.1584 22.5 26.6667 20.9833 26.6667 19.1667C26.6667 19.625 26.6667 20 26.6667 20" fill="currentColor" />
                </svg>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "As a developer, I appreciate the quality and organization of the scripts here. I've learned a lot about best practices by studying the code from other contributors."
                </p>
                <div className="flex items-center mt-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      ER
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Emily Rodriguez</h4>
                    <p className="text-sm text-gray-500">Software Developer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100 relative">
              <div className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
                  <path d="M12.8334 20H7.50008C7.04175 20 6.66675 19.625 6.66675 19.1667V14.1667C6.66675 10.9833 9.25008 8.33333 12.5001 8.33333H13.3334C13.7917 8.33333 14.1667 8.70833 14.1667 9.16667V12.5C14.1667 12.9583 13.7917 13.3333 13.3334 13.3333H12.5001C11.5834 13.3333 10.8334 14.0833 10.8334 15V15.8333C10.8334 16.2917 11.2084 16.6667 11.6667 16.6667H12.8334C16.1501 16.6667 18.8334 19.35 18.8334 22.6667V26.6667C18.8334 30.0167 16.1834 32.6667 12.8334 32.6667H7.50008C7.04175 32.6667 6.66675 32.2917 6.66675 31.8333V27.5C6.66675 27.0417 7.04175 26.6667 7.50008 26.6667H12.8334C13.7501 26.6667 14.5001 25.9167 14.5001 25V24.1667C14.5001 23.25 13.7501 22.5 12.8334 22.5H10.0001C8.15841 22.5 6.66675 20.9833 6.66675 19.1667C6.66675 19.625 6.66675 20 6.66675 20" fill="currentColor" />
                  <path d="M32.8334 20H27.5001C27.0417 20 26.6667 19.625 26.6667 19.1667V14.1667C26.6667 10.9833 29.2501 8.33333 32.5001 8.33333H33.3334C33.7917 8.33333 34.1667 8.70833 34.1667 9.16667V12.5C34.1667 12.9583 33.7917 13.3333 33.3334 13.3333H32.5001C31.5834 13.3333 30.8334 14.0833 30.8334 15V15.8333C30.8334 16.2917 31.2084 16.6667 31.6667 16.6667H32.8334C36.1501 16.6667 38.8334 19.35 38.8334 22.6667V26.6667C38.8334 30.0167 36.1834 32.6667 32.8334 32.6667H27.5001C27.0417 32.6667 26.6667 32.2917 26.6667 31.8333V27.5C26.6667 27.0417 27.0417 26.6667 27.5001 26.6667H32.8334C33.7501 26.6667 34.5001 25.9167 34.5001 25V24.1667C34.5001 23.25 33.7501 22.5 32.8334 22.5H30.0001C28.1584 22.5 26.6667 20.9833 26.6667 19.1667C26.6667 19.625 26.6667 20 26.6667 20" fill="currentColor" />
                </svg>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "The security scripts I downloaded helped me harden my Linux servers and gave me peace of mind. The documentation is excellent and made implementation straightforward."
                </p>
                <div className="flex items-center mt-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      MK
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Michael Kim</h4>
                    <p className="text-sm text-gray-500">Network Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div id="scripts" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-4xl">
                All Scripts
              </h2>
              <p className="mt-2 text-xl text-gray-500">
                Browse our collection of {scripts.length} Linux scripts
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full sm:w-auto py-3 pl-3 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg sm:text-sm shadow-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Applied filters */}
          {(languageFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <div className="bg-indigo-50 rounded-lg py-3 px-4 mb-8 flex flex-wrap items-center gap-2">
              <span className="text-sm text-indigo-700 font-medium">Active filters:</span>
              
              {languageFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Language: {languageFilter}
                  <button 
                    onClick={() => setLanguageFilter('all')} 
                    className="ml-1 text-indigo-600 hover:text-indigo-900"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Category: {categories.find(c => c.id === categoryFilter)?.name || categoryFilter}
                  <button 
                    onClick={() => setCategoryFilter('all')} 
                    className="ml-1 text-indigo-600 hover:text-indigo-900"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="ml-1 text-indigo-600 hover:text-indigo-900"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              <button
                onClick={() => { setSearchQuery(''); setLanguageFilter('all'); setCategoryFilter('all'); }}
                className="ml-auto text-sm text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
          
          {/* Scripts grid */}
          {filteredScripts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredScripts.map((script) => (
                  <div 
                    key={script.id} 
                    className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col transform hover:-translate-y-1"
                  >
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getLanguageColor(script.language)}`}>
                          {script.language}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(script.created_at)}</span>
                      </div>
                      <Link href={`/scripts/${script.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                          {script.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {script.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {script.tags && script.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-6 py-3 flex justify-between items-center bg-gray-50">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <span className="text-gray-500">Difficulty: </span>
                          <span className={`font-medium ${script.difficulty === 'Advanced' ? 'text-red-600' : script.difficulty === 'Intermediate' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {script.difficulty || 'Beginner'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="text-sm text-gray-500">{script.downloads}</span>
                        </div>
                        <Link href={`/scripts/${script.slug}`} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                          View
                          <span className="inline-block ml-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredScripts.length < scripts.length && (
                <div className="text-center bg-white shadow-sm rounded-lg p-6 border border-gray-100">
                  <p className="text-gray-600">
                    Showing {filteredScripts.length} of {scripts.length} scripts
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setLanguageFilter('all'); setCategoryFilter('all'); }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                  >
                    View All Scripts
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <svg className="mx-auto h-20 w-20 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01M12 13a1 1 0 100-2 1 1 0 000 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-bold text-gray-900">No scripts found</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                We couldn't find any scripts matching your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setLanguageFilter('all'); setCategoryFilter('all'); }}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <span className="block">Ready to automate your Linux tasks?</span>
                <span className="block text-indigo-200 mt-1">Start using our scripts today.</span>
              </h2>
              <p className="mt-4 text-lg text-indigo-100 max-w-3xl">
                Join thousands of Linux enthusiasts and professionals who save time and increase productivity with our collection of ready-to-use scripts.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#scripts"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Browse All Scripts
                </a>
                <a
                  href="/contribute-script"
                  className="inline-flex items-center justify-center px-5 py-3 border border-indigo-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Contribute Your Script
                </a>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Open source</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Well documented</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Easily customizable</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Actively maintained</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Security focused</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-100">Community-driven</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white p-6 rounded-lg shadow-2xl">
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-md p-3 font-mono text-gray-800 text-sm">
                      <p><span className="text-green-600">#!/bin/bash</span></p>
                      <p><span className="text-purple-600">function</span> <span className="text-blue-600">automate_everything</span>() {'{'}</p>
                      <p>  <span className="text-gray-600"># Your Linux journey starts here</span></p>
                      <p>  <span className="text-green-600">echo</span> <span className="text-yellow-600">"Starting automation..."</span></p>
                      <p>  <span className="text-green-600">echo</span> <span className="text-yellow-600">"Tasks completed successfully!"</span></p>
                      <p>{'}'}</p>
                      <p>&nbsp;</p>
                      <p><span className="text-blue-600">automate_everything</span></p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>automation.sh</span>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                      Download Now
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 bg-indigo-300 rounded-lg transform translate-x-3 translate-y-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        
        .animate-typing {
          animation: typing 8s steps(40) forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 