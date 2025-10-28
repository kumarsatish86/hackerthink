'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapData, RoadmapPageClientProps, RoadmapModule } from '@/types/roadmap';

// Enhanced Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: "backOut" }
  }
};

export default function RoadmapPageClient({ roadmap }: RoadmapPageClientProps) {
  // Parse JSON fields that might be stored as strings in the database
  const parseJsonField = (field: any) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Parse roadmap fields safely with fallback data
  console.log('Raw roadmap.prerequisites:', roadmap.prerequisites);
  let prerequisites = parseJsonField(roadmap.prerequisites);
  console.log('Parsed prerequisites:', prerequisites);
  if (!prerequisites || prerequisites.length === 0) {
    // Create roadmap-specific prerequisites based on the roadmap title/slug
    const roadmapSpecificPrerequisites = {
      'linux-storage-management': [
        {
          title: "Linux Command Line Proficiency",
          description: "Comfortable with basic Linux commands, file navigation, and text editing in terminal."
        },
        {
          title: "Basic System Administration",
          description: "Understanding of user permissions, process management, and system service concepts."
        },
        {
          title: "Hardware Fundamentals",
          description: "Basic knowledge of computer hardware components, especially storage devices."
        },
        {
          title: "Networking Basics",
          description: "Understanding of basic networking concepts and remote system access via SSH."
        }
      ],
      'devops-engineer': [
        {
          title: "Linux System Administration",
          description: "Solid understanding of Linux systems, command line, and server management."
        },
        {
          title: "Programming Experience",
          description: "Basic programming skills in at least one language (Python, Bash, or similar)."
        },
        {
          title: "Version Control",
          description: "Familiarity with Git and collaborative development workflows."
        },
        {
          title: "Cloud Computing Basics",
          description: "Understanding of cloud concepts and experience with at least one cloud provider."
        }
      ],
      'default': [
        {
          title: "Basic Computer Skills",
          description: "Familiarity with computer operations, file management, and basic troubleshooting."
        },
        {
          title: "Command Line Basics",
          description: "Understanding of basic command-line operations and terminal navigation."
        },
        {
          title: "Problem-Solving Mindset",
          description: "Analytical thinking and willingness to learn through hands-on practice."
        },
        {
          title: "Time Commitment",
          description: "Ability to dedicate 5-10 hours per week for consistent learning progress."
        }
      ]
    };
    
    prerequisites = roadmapSpecificPrerequisites[roadmap.slug] || roadmapSpecificPrerequisites['default'];
  }
  
  let careerOutcomes = parseJsonField(roadmap.career_outcomes);
  if (!careerOutcomes || careerOutcomes.length === 0) {
    // Create roadmap-specific career outcomes
    const roadmapSpecificOutcomes = {
      'linux-storage-management': [
        {
          title: "Storage Administrator",
          description: "Manage enterprise storage systems, implement backup solutions, and optimize storage performance.",
          salary: "$70,000 - $110,000"
        },
        {
          title: "System Administrator",
          description: "Administer Linux servers with focus on storage management and data protection.",
          salary: "$65,000 - $95,000"
        },
        {
          title: "Infrastructure Engineer",
          description: "Design and implement storage infrastructure for enterprise environments.",
          salary: "$80,000 - $125,000"
        },
        {
          title: "Cloud Storage Specialist",
          description: "Manage cloud storage solutions and hybrid storage architectures.",
          salary: "$85,000 - $130,000"
        },
        {
          title: "Database Administrator",
          description: "Optimize database storage, implement backup strategies, and ensure data integrity.",
          salary: "$75,000 - $115,000"
        },
        {
          title: "Technical Consultant",
          description: "Provide expert guidance on storage solutions and data management strategies.",
          salary: "$90,000 - $140,000"
        }
      ],
      'devops-engineer': [
        {
          title: "DevOps Engineer",
          description: "Implement CI/CD pipelines, automation, and infrastructure as code.",
          salary: "$85,000 - $130,000"
        },
        {
          title: "Site Reliability Engineer",
          description: "Ensure system reliability, performance monitoring, and incident response.",
          salary: "$100,000 - $160,000"
        },
        {
          title: "Cloud Engineer",
          description: "Design and manage cloud infrastructure on AWS, Azure, or Google Cloud.",
          salary: "$90,000 - $140,000"
        },
        {
          title: "Platform Engineer",
          description: "Build and maintain developer platforms and internal tooling.",
          salary: "$95,000 - $150,000"
        },
        {
          title: "Infrastructure Architect",
          description: "Design scalable infrastructure solutions and automation frameworks.",
          salary: "$110,000 - $170,000"
        },
        {
          title: "Technical Lead",
          description: "Lead DevOps teams and drive technical strategy for infrastructure.",
          salary: "$120,000 - $180,000"
        }
      ],
      'default': [
        {
          title: "System Administrator",
          description: "Manage and maintain Linux servers, networks, and enterprise infrastructure.",
          salary: "$65,000 - $95,000"
        },
        {
          title: "DevOps Engineer",
          description: "Implement CI/CD pipelines, automation, and infrastructure as code.",
          salary: "$85,000 - $130,000"
        },
        {
          title: "Cloud Engineer",
          description: "Design and manage cloud infrastructure on AWS, Azure, or Google Cloud.",
          salary: "$90,000 - $140,000"
        },
        {
          title: "Site Reliability Engineer",
          description: "Ensure system reliability, performance monitoring, and incident response.",
          salary: "$100,000 - $160,000"
        },
        {
          title: "Security Engineer",
          description: "Implement security measures, conduct audits, and manage compliance.",
          salary: "$95,000 - $150,000"
        },
        {
          title: "Technical Consultant",
          description: "Provide expert guidance on Linux implementations and best practices.",
          salary: "$80,000 - $120,000"
        }
      ]
    };
    
    careerOutcomes = roadmapSpecificOutcomes[roadmap.slug] || roadmapSpecificOutcomes['default'];
  }
  
  const relatedRoadmaps = parseJsonField(roadmap.related_roadmaps);

  // Parse modules and their resources
  const parsedModules = roadmap.modules?.map(module => ({
    ...module,
    resources: parseJsonField(module.resources)
  })) || [];

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [fetchedRoadmaps, setFetchedRoadmaps] = useState<any[]>([]);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({
    completed: 0,
    total: parsedModules.length || 0,
    percentage: 0
  });

  
  useEffect(() => {
    // Set the first module as active by default if modules exist
    if (parsedModules && parsedModules.length > 0 && !activeModuleId) {
      setActiveModuleId(parsedModules[0].id);
    }
  }, [parsedModules, activeModuleId]);

  useEffect(() => {
    // Fetch related roadmaps from API
    const fetchRelatedRoadmaps = async () => {
      try {
        console.log('Fetching related roadmaps...');
        const response = await fetch('/api/roadmaps');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const allRoadmaps = await response.json();
          console.log('All roadmaps received:', allRoadmaps.length, allRoadmaps);
          console.log('Current roadmap slug:', roadmap.slug);
          
          // Filter out the current roadmap and limit to 3 related ones
          const filtered = allRoadmaps
            .filter((r: any) => r.slug !== roadmap.slug)
            .slice(0, 3);
          console.log('Filtered roadmaps:', filtered);
          setFetchedRoadmaps(filtered);
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          // Set test data as fallback
          setFetchedRoadmaps([
            { id: 1, title: 'Test Roadmap 1', slug: 'test-1', description: 'Test description 1' },
            { id: 2, title: 'Test Roadmap 2', slug: 'test-2', description: 'Test description 2' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching related roadmaps:', error);
        // Set test data as fallback for error case too
        setFetchedRoadmaps([
          { id: 1, title: 'DevOps Engineer Path', slug: 'devops-engineer', description: 'Master CI/CD, containerization, and infrastructure automation' },
          { id: 2, title: 'Cybersecurity Fundamentals', slug: 'cybersecurity', description: 'Learn security principles, threat detection, and system hardening' }
        ]);
      }
    };

    fetchRelatedRoadmaps();
  }, [roadmap.slug]);

  useEffect(() => {
    // Update progress when completed modules change
    const completedCount = completedModules.size;
    const total = parsedModules.length || 0;
    setProgress({
      completed: completedCount,
      total,
      percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0
    });
  }, [completedModules, parsedModules]);

  const toggleModuleCompletion = (moduleId: string) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getActiveModule = (): RoadmapModule | null => {
    if (!activeModuleId || !parsedModules) return null;
    return parsedModules.find(module => module.id === activeModuleId) || null;
  };

  const activeModule = getActiveModule();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Breadcrumb */}
          <motion.nav 
            className="flex mb-8" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-purple-200 hover:text-white transition-colors">🏠 Home</Link>
              <span className="text-purple-300">/</span>
              <Link href="/learning-roadmap" className="text-purple-200 hover:text-white transition-colors">Learning Roadmaps</Link>
              <span className="text-purple-300">/</span>
              <span className="text-white font-medium">{roadmap.title}</span>
            </div>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Main Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-sm font-medium text-white mb-6"
                variants={scaleIn}
              >
                🚀 Interactive Learning Roadmap
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                variants={fadeInUp}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
                  {roadmap.title}
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl"
                variants={fadeInUp}
              >
                {roadmap.description}
              </motion.p>
              
              {/* Interactive Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-6 mb-10"
                variants={staggerContainer}
              >
                <motion.div 
                  className="text-center group cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
                    {parsedModules.length || 0}
                  </div>
                  <div className="text-purple-200 text-sm">Learning Modules</div>
                </motion.div>
                
                <motion.div 
                  className="text-center group cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
                    {roadmap.level || 'All'}
                  </div>
                  <div className="text-purple-200 text-sm">Skill Level</div>
                </motion.div>
                
                <motion.div 
                  className="text-center group cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-2">⏱️</div>
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
                    {roadmap.duration || '90d'}
                  </div>
                  <div className="text-purple-200 text-sm">Duration</div>
                </motion.div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <motion.button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const moduleSection = document.getElementById('roadmap-visualization');
                    moduleSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  🎯 Start Your Journey
                </motion.button>
                
                <motion.button
                  className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 text-white font-semibold py-4 px-8 rounded-full hover:bg-opacity-20 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 Track Progress
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Interactive Progress Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Learning Dashboard</h3>
                  <div className="text-3xl animate-bounce">🎯</div>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: progress.percentage / 100 }}
                      transition={{ duration: 2, delay: 1 }}
                      style={{
                        strokeDasharray: "439.82",
                        strokeDashoffset: 439.82 * (1 - progress.percentage / 100),
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{progress.percentage}%</div>
                      <div className="text-sm text-purple-200">Complete</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                      Modules Completed
                    </span>
                    <span className="font-bold text-lg">{progress.completed}/{progress.total}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-white">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      Current Streak
                    </span>
                    <span className="font-bold text-lg">5 days 🔥</span>
                  </div>
                  
                  <motion.button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg mt-6"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Continue Learning
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Prerequisites Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Prerequisites</h2>
            <p className="text-lg text-gray-600">Required knowledge and skills before starting this program</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prerequisites.map((prerequisite, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{prerequisite.title}</h3>
                    <p className="text-gray-600">{prerequisite.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Curriculum */}
      <section id="roadmap-visualization" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mb-4">
              Learning Curriculum
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {roadmap.title} Training Program
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive curriculum designed to build expertise through structured learning modules.
            </p>
          </div>

          {/* Course Overview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{parsedModules.length}</div>
                <div className="text-sm text-gray-600">Total Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{parsedModules.length * 2}h</div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">All Levels</div>
                <div className="text-sm text-gray-600">Beginner to Advanced</div>
              </div>
            </div>
          </div>

          {/* Course Modules - Horizontal Timeline */}
          <div className="space-y-8">
            {/* Timeline Navigation */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
              
              {/* Timeline Points */}
              <div className="relative flex justify-between z-10">
                {parsedModules.map((module, index) => {
                  const isActive = activeModuleId === module.id;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newActiveId = isActive ? null : module.id;
                        setActiveModuleId(newActiveId);
                      }}
                      className="flex flex-col items-center group focus:outline-none cursor-pointer hover:scale-105 transition-transform duration-200 relative z-10 pointer-events-auto"
                    >
                      {/* Timeline Dot */}
                      <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-700 hover:shadow-md'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Module Title */}
                      <div className="mt-3 text-center max-w-32">
                        <div className={`text-sm font-semibold transition-colors ${
                          isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                        }`}>
                          {module.title.split(' ').slice(0, 3).join(' ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {module.duration || 'Self-paced'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Module Content */}
            {activeModuleId && (() => {
              const activeModule = parsedModules.find(m => m.id === activeModuleId);
              const moduleIndex = parsedModules.findIndex(m => m.id === activeModuleId);
              
              if (!activeModule) return null;
              
              return (
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-bold">{moduleIndex + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{activeModule.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {activeModule.duration || 'Self-paced'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {moduleIndex < 2 ? 'Beginner' : moduleIndex < 4 ? 'Intermediate' : 'Advanced'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Module Description */}
                    <p className="text-gray-700 leading-relaxed">
                      {activeModule.description}
                    </p>
                  </div>
                  
                  {/* Two Column Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    {/* Skills You'll Learn */}
                    <div className="p-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Skills You'll Learn
                      </h4>
                      
                      <div className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                          {activeModule.skills || activeModule.description}
                        </p>
                        
                        {/* Dynamic Skills List */}
                        <div className="space-y-2">
                          {activeModule.title.toLowerCase().includes('storage') && (
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Understanding storage device types and interfaces
                              </li>
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Linux device recognition and naming conventions
                              </li>
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                File system types and management commands
                              </li>
                            </ul>
                          )}
                          
                          {activeModule.title.toLowerCase().includes('partition') && (
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Creating and managing disk partitions
                              </li>
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                File system mounting and fstab configuration
                              </li>
                              <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Automount and mount options optimization
                              </li>
                            </ul>
                          )}
                          
                          {/* Add more skill lists for other modules */}
                        </div>
                      </div>
                    </div>
                    
                    {/* Resources */}
                    <div className="p-8 bg-gray-50">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Learning Resources
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Sample Resources - Replace with actual module resources */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">Video Tutorial</h5>
                              <p className="text-sm text-gray-600">Interactive walkthrough of key concepts</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">Lab Exercise</h5>
                              <p className="text-sm text-gray-600">Hands-on practice with real scenarios</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">Reference Guide</h5>
                              <p className="text-sm text-gray-600">Comprehensive command reference</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">Practice Quiz</h5>
                              <p className="text-sm text-gray-600">Test your knowledge and understanding</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {/* Career Outcomes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Outcomes</h2>
            <p className="text-lg text-gray-600">Professional opportunities and career paths after completing this program</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerOutcomes.map((outcome, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{outcome.title}</h3>
                    <p className="text-gray-600 mb-3">{outcome.description}</p>
                    {outcome.salary && (
                      <div className="text-sm font-semibold text-green-600">
                        Salary Range: {outcome.salary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Roadmaps Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Learning Paths</h2>
            <p className="text-lg text-gray-600">Continue your learning journey with these complementary programs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fetchedRoadmaps.length > 0 ? (
              fetchedRoadmaps.map((relatedRoadmap, index) => {
                // Dynamic icon colors based on index
                const iconColors = [
                  { bg: 'bg-blue-100', text: 'text-blue-600' },
                  { bg: 'bg-purple-100', text: 'text-purple-600' },
                  { bg: 'bg-orange-100', text: 'text-orange-600' },
                ];
                const colors = iconColors[index % iconColors.length];
                
                return (
                  <div key={relatedRoadmap.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedRoadmap.title}</h3>
                        <p className="text-gray-600 mb-3">{relatedRoadmap.description}</p>
                        {relatedRoadmap.level && (
                          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full mb-3">
                            {relatedRoadmap.level}
                          </span>
                        )}
                        <a 
                          href={`/learning-roadmap/${relatedRoadmap.slug}`} 
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium block"
                        >
                          View Roadmap →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback content while loading or if no related roadmaps
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  {fetchedRoadmaps.length === 0 ? 'Loading related roadmaps...' : 'No related roadmaps available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}