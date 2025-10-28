'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';

// Define command type
interface Command {
  id: string;
  title: string;
  slug: string;
  description: string;
  syntax: string;
  category: string;
  platform: string;
  icon?: string;
  popularity: number;
  users_count?: number;
}

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Featured command categories with descriptions
  const featuredCategories = [
    {
      title: 'File Management',
      description: 'Manage files and directories on your system',
      icon: '📁',
      category: 'file-management',
      commands: ['ls', 'cp', 'mv', 'rm']
    },
    {
      title: 'User Management',
      description: 'Create, modify, and manage user accounts',
      icon: '👤',
      category: 'user-management',
      commands: ['useradd', 'userdel', 'passwd', 'chage']
    },
    {
      title: 'Process Management',
      description: 'Monitor and control system processes',
      icon: '⚙️',
      category: 'process-management',
      commands: ['ps', 'top', 'kill', 'nice']
    },
    {
      title: 'Networking',
      description: 'Network configuration and troubleshooting',
      icon: '🌐',
      category: 'networking',
      commands: ['ping', 'ssh', 'ifconfig', 'netstat']
    },
    {
      title: 'Permissions',
      description: 'Manage file and directory permissions',
      icon: '🔒',
      category: 'permissions',
      commands: ['chmod', 'chown', 'chgrp', 'umask']
    },
    {
      title: 'Package Management',
      description: 'Install, update, and manage software packages',
      icon: '📦',
      category: 'package-management',
      commands: ['apt', 'yum', 'dnf', 'pacman']
    }
  ];
  
  // Top platforms
  const topPlatforms = ['linux', 'unix', 'macos', 'all'];
  
  useEffect(() => {
    // Fetch commands from API
    async function fetchCommands() {
      try {
        setLoading(true);
        const response = await fetch('/api/commands');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch commands: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Format commands for UI
        const formattedCommands = data.commands.map((command: any) => ({
          id: command.id.toString(),
          title: command.title,
          slug: command.slug,
          description: command.description,
          syntax: command.syntax || '',
          category: command.category || 'misc',
          platform: command.platform || 'linux',
          icon: command.icon,
          popularity: command.popularity || 75,
          users_count: command.users_count || undefined
        }));
        
        setCommands(formattedCommands);
        setError(null);
      } catch (err) {
        console.error('Error fetching commands:', err);
        setError('Failed to load commands. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCommands();
  }, []);
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'file-management', name: 'File Management' },
    { id: 'user-management', name: 'User Management' },
    { id: 'process-management', name: 'Process Management' },
    { id: 'networking', name: 'Networking' },
    { id: 'permissions', name: 'Permissions' },
    { id: 'package-management', name: 'Package Management' },
    { id: 'system-management', name: 'System Management' },
    { id: 'misc', name: 'Miscellaneous' }
  ];
  
  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'linux', name: 'Linux' },
    { id: 'unix', name: 'Unix' },
    { id: 'macos', name: 'macOS' }
  ];
  
  // Filter commands based on search, category, and platform
  const filteredCommands = commands.filter((command) => {
    const matchesSearch = searchQuery === '' || 
      command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || command.category === categoryFilter;
    const matchesPlatform = platformFilter === 'all' || command.platform === platformFilter;
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });
  
  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'file-management': 'bg-blue-100 text-blue-800',
      'user-management': 'bg-green-100 text-green-800',
      'process-management': 'bg-purple-100 text-purple-800',
      'networking': 'bg-yellow-100 text-yellow-800',
      'permissions': 'bg-red-100 text-red-800',
      'package-management': 'bg-indigo-100 text-indigo-800',
      'system-management': 'bg-pink-100 text-pink-800',
      'misc': 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  // Helper function to display popularity badge
  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Popular
        </span>
      );
    }
    return null;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Linux Commands Library
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Discover and learn about essential Linux commands with syntax, examples, and detailed explanations
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Commands</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search by command name or description"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              id="platform"
              name="platform"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Featured categories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">{category.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.commands.map((cmd) => (
                    <span key={cmd} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {cmd}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setCategoryFilter(category.category)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {category.title} commands →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Commands list */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {categoryFilter !== 'all' 
            ? `${categories.find(c => c.id === categoryFilter)?.name} Commands` 
            : 'All Commands'}
          {filteredCommands.length > 0 && ` (${filteredCommands.length})`}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredCommands.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No commands found matching your criteria.</p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPlatformFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div id="commands" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCommands.map((command) => (
              <div key={command.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-teal-600"></div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(command.category)}`}>
                      {command.category.replace('-', ' ')}
                    </span>
                    {getPopularityBadge(command.popularity)}
                  </div>
                  <Link href={`/commands/${command.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-700 transition-colors duration-200">
                      {command.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {command.description}
                  </p>
                  
                  {command.syntax && (
                    <div className="mt-2 mb-4">
                      <div className="bg-gray-800 rounded-md p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-200 font-mono">{command.syntax}</pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    <span className="inline-flex items-center mr-4">
                      <svg className="mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {command.platform}
                    </span>
                    <Link 
                      href={`/commands/${command.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-auto"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section className="bg-gray-50 rounded-lg p-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Master Linux Commands</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Enhance your Linux skills by learning these essential commands. Perfect for beginners and experienced users alike.
          </p>
          <a 
            href="#commands" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Explore All Commands
          </a>
        </div>
      </section>
    </div>
  );
} 