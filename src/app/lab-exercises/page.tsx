'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LabExercise {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  category?: string;
  duration: number;  // Changed from estimated_time to match DB schema
  completion_rate?: number;
  skills_learned?: string[];
  featured_image?: string;
  author_name?: string;
}

export default function LabExercisesPage() {
  const [exercises, setExercises] = useState<LabExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'beginner', 'intermediate', 'advanced'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Featured categories with skills
  const skillCategories = [
    {
      title: 'System Administration',
      description: 'Core skills for Linux system administrators',
      skills: ['User Management', 'File Permissions', 'Process Control', 'Service Management', 'Package Management']
    },
    {
      title: 'Network Administration',
      description: 'Essential networking skills for IT professionals',
      skills: ['IP Configuration', 'Firewalls', 'DNS Setup', 'Network Troubleshooting', 'VPN Configuration']
    },
    {
      title: 'Security Hardening',
      description: 'Critical security skills to protect Linux systems',
      skills: ['Encryption', 'Access Control', 'Vulnerability Assessment', 'Intrusion Detection', 'Security Auditing']
    }
  ];
  
  // Testimonials from users
  const testimonials = [
    {
      name: 'Michael Chen',
      role: 'DevOps Engineer',
      company: 'TechCorp',
      content: 'These hands-on lab exercises were instrumental in helping me transition to a DevOps role. The practical approach solidified my Linux skills in ways that theoretical learning never could.',
      avatar: '/images/avatars/avatar-1.jpg'
    },
    {
      name: 'Sarah Johnson',
      role: 'System Administrator',
      company: 'CloudSystems Inc.',
      content: 'I use these lab exercises both for my own skill development and for training new team members. The progression from beginner to advanced topics is well thought out.',
      avatar: '/images/avatars/avatar-2.jpg'
    },
    {
      name: 'David Rodriguez',
      role: 'Security Analyst',
      company: 'SecureNet',
      content: 'The security-focused lab exercises helped me prepare for my certification exams and gave me practical experience I use daily in my security work.',
      avatar: '/images/avatars/avatar-3.jpg'
    }
  ];
  
  // Define skills mapping for different exercises
  const skillsMapping: Record<string, string[]> = {
    'basic-linux-commands': ['File Navigation', 'Directory Management', 'File Manipulation'],
    'file-permissions-linux': ['Permission Management', 'Security Configuration', 'Access Control'],
    'shell-scripting-basics': ['Bash Scripting', 'Automation', 'Script Debugging'],
    'networking-with-linux': ['Network Configuration', 'Interface Management', 'Troubleshooting'],
    'user-management-linux': ['User Administration', 'Group Management', 'Permission Planning'],
    'iptables-firewall-configuration': ['Firewall Rules', 'Network Security', 'Traffic Control'],
    'ssh-configuration-hardening': ['SSH Security', 'Key Management', 'Secure Access'],
    'linux-disk-management': ['Disk Partitioning', 'LVM', 'Filesystem Management'],
    'web-server-configuration': ['Web Server Setup', 'Performance Tuning', 'Security Configuration']
  };
  
  // Define completion rates for exercises (normally this would come from a user progress database)
  const completionRates: Record<string, number> = {
    'basic-linux-commands': 94,
    'file-permissions-linux': 87,
    'shell-scripting-basics': 82,
    'networking-with-linux': 76,
    'user-management-linux': 89,
    'iptables-firewall-configuration': 71,
    'ssh-configuration-hardening': 84,
    'linux-disk-management': 80,
    'web-server-configuration': 78
  };

  // Category mapping based on slug (this would ideally come from the database)
  const categoryMapping: Record<string, string> = {
    'basic-linux-commands': 'linux-basics',
    'file-permissions-linux': 'linux-administration',
    'shell-scripting-basics': 'scripting',
    'networking-with-linux': 'networking',
    'user-management-linux': 'linux-administration',
    'iptables-firewall-configuration': 'security',
    'ssh-configuration-hardening': 'security',
    'linux-disk-management': 'linux-administration',
    'web-server-configuration': 'system-services'
  };
  
  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true);
        
        // Fetch data from the API endpoint
        const response = await fetch('/api/lab-exercises?limit=20&page=1');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Error fetching lab exercises: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API response:', data); // Log the full API response for debugging
        
        if (!data.lab_exercises || !Array.isArray(data.lab_exercises)) {
          console.error('Invalid API response format:', data);
          throw new Error('Invalid response format from API');
        }
        
        // Map the API response to our component's expected format
        const mappedExercises = data.lab_exercises.map((exercise: any) => ({
          id: exercise.id?.toString() || 'unknown',
          title: exercise.title || 'Untitled Exercise',
          slug: exercise.slug || 'unknown-slug',
          description: exercise.description || 'No description available',
          difficulty: exercise.difficulty?.toLowerCase() || 'beginner',
          category: exercise.category || categoryMapping[exercise.slug] || 'linux-basics',
          duration: exercise.duration || 60,
          completion_rate: exercise.completion_rate || completionRates[exercise.slug] || Math.floor(Math.random() * 30) + 70,
          skills_learned: exercise.skills_learned || skillsMapping[exercise.slug] || ['Linux Skills'],
          featured_image: exercise.featured_image,
          author_name: exercise.author_name
        }));
        
        setExercises(mappedExercises);
      } catch (err) {
        console.error('Error fetching lab exercises:', err);
        setError('Failed to load lab exercises. Please try again later.');
        
        // Fallback to mock data if the API fails
        setExercises([
          {
            id: '1',
            title: 'Basic Linux Commands',
            slug: 'basic-linux-commands',
            description: 'Learn and practice essential Linux commands like ls, cd, mkdir, rm, etc.',
            difficulty: 'beginner',
            category: 'linux-basics',
            duration: 45,
            completion_rate: 94,
            skills_learned: ['File Navigation', 'Directory Management', 'File Manipulation']
          },
          {
            id: '2',
            title: 'File Permissions in Linux',
            slug: 'file-permissions-linux',
            description: 'Understanding and configuring file permissions using chmod and chown commands.',
            difficulty: 'intermediate',
            category: 'linux-administration',
            duration: 60,
            completion_rate: 87,
            skills_learned: ['Permission Management', 'Security Configuration', 'Access Control']
          },
          {
            id: '3',
            title: 'Shell Scripting Basics',
            slug: 'shell-scripting-basics',
            description: 'Introduction to shell scripting with bash, creating and executing simple scripts.',
            difficulty: 'beginner',
            category: 'scripting',
            duration: 90,
            completion_rate: 82,
            skills_learned: ['Bash Scripting', 'Automation', 'Script Debugging']
          },
          // Additional exercises would go here
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchExercises();
  }, []);
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'linux-basics', name: 'Linux Basics' },
    { id: 'linux-administration', name: 'Linux Administration' },
    { id: 'scripting', name: 'Scripting' },
    { id: 'networking', name: 'Networking' },
    { id: 'security', name: 'Security' },
    { id: 'system-services', name: 'System Services' }
  ];
  
  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];
  
  const filteredExercises = exercises.filter(exercise => {
    if (filter !== 'all' && exercise.difficulty !== filter) return false;
    if (categoryFilter !== 'all' && exercise.category !== categoryFilter) return false;
    if (searchQuery && !exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !exercise.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  };
  
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-800 to-indigo-900 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-full h-full opacity-20" 
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' }}>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                Hands-On Lab Exercises
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-blue-100 lg:mx-0 mx-auto">
                Choose from our collection of hands-on exercises designed to build practical skills
              </p>
            </div>
            <div className="mt-10 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative h-80 w-80">
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-blue-500 bg-opacity-30 rounded-full"></div>
                <div className="absolute w-72 h-72 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-2xl transform rotate-3"></div>
                <div className="absolute inset-0 w-72 h-72 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl transform -rotate-2"></div>
                <div className="absolute inset-0 w-72 h-72 bg-white rounded-xl shadow-2xl flex flex-col justify-center items-center p-6">
                  <svg className="w-20 h-20 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="text-gray-800 font-semibold text-lg text-center mb-2">Advanced Learning Experience</div>
                  <div className="text-gray-600 text-sm text-center">Master Linux concepts with our interactive lab environment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Skills Categories Section */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Build Critical Linux Skills</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our hands-on lab exercises help you master essential skills through practical application
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-12">
          <div className="md:flex md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Search Exercises</h2>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title or description..."
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  id="difficulty-filter"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category-filter"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Show loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-700">Loading exercises...</p>
          </div>
        )}

        {/* Show error state */}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 p-6 my-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading exercises</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <p className="mt-2 text-sm text-red-700">Showing available exercises instead.</p>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading && filteredExercises.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-12">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No exercises found</h3>
              <p className="text-gray-500">Try changing your search criteria or filters</p>
            </div>
          )}
          
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-3">
                <div className={`absolute top-0 left-0 w-full h-3 ${exercise.difficulty === 'beginner' ? 'bg-green-500' : exercise.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                      </span>
                      <div className="flex ml-auto space-x-2">
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatTime(exercise.duration)}
                        </span>
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {exercise.category?.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/lab-exercises/${exercise.slug}`}
                      className="block mt-3 text-xl font-semibold text-gray-900 hover:text-blue-600 transition"
                    >
                      {exercise.title}
                    </Link>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                      {exercise.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">Skills You'll Learn:</div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.skills_learned?.map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700">{exercise.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${exercise.completion_rate}%` }}></div>
                  </div>
                </div>
                
                <div className="mt-5">
                  <Link
                    href={`/lab-exercises/${exercise.slug}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Start Exercise
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Users Say</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from professionals who have improved their skills with our lab exercises
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to enhance your Linux skills?</span>
            <span className="block text-blue-200">Start a lab exercise today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="#exercises"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Browse Exercises
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 