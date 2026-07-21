'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapListPageClientProps, RoadmapListItem } from '@/types/roadmap';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardHover = {
  hover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2 }
  }
};

export default function RoadmapListPageClient({ categories, featuredRoadmaps }: RoadmapListPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('all-roadmaps');
  const [searchQuery, setSearchQuery] = useState('');

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Filter roadmaps based on search query
  const filterRoadmaps = (roadmaps: RoadmapListItem[]) => {
    if (!searchQuery) return roadmaps;
    return roadmaps.filter(roadmap => 
      roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Get roadmaps based on active category
  const activeRoadmaps = activeCategory === 'all-roadmaps' 
    ? featuredRoadmaps 
    : categories.find(cat => cat.id === activeCategory)?.roadmaps || [];
  const filteredRoadmaps = filterRoadmaps(activeRoadmaps);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Learning Roadmaps
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Structured learning paths to master Linux, DevOps, and cloud technologies. 
              Choose your journey and advance your career with expert-guided roadmaps.
            </p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search roadmaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 pl-6 pr-16 text-gray-700 bg-white bg-opacity-90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-100 shadow-xl transition-all duration-200"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors cursor-pointer">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Featured Roadmaps */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Featured Roadmaps</h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Start with these popular learning paths designed for different skill levels and career goals
            </p>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredRoadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap.id}
                  variants={fadeIn}
                  whileHover="hover"
                >
                  <Link href={`/learning-roadmap/${roadmap.slug}`}>
                    <motion.div 
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                      variants={cardHover}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(roadmap.level)}`}>
                            {roadmap.level.charAt(0).toUpperCase() + roadmap.level.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{roadmap.timeToComplete}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                          {roadmap.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {roadmap.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {roadmap.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {roadmap.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{roadmap.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-purple-600 font-medium text-sm">Start Learning →</span>
                          <div className="flex items-center text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">All Learning Paths</h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Browse our complete collection of learning roadmaps organized by category
            </p>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {/* All Roadmaps Button */}
              <motion.button
                onClick={() => setActiveCategory('all-roadmaps')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === 'all-roadmaps'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Roadmaps
              </motion.button>
              
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.title}
                </motion.button>
              ))}
            </div>

            {/* Active Category Description */}
            <motion.div 
              className="text-center mb-8"
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeCategory === 'all-roadmaps' ? (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Complete learning journeys for mastering Linux and DevOps skills
                </p>
              ) : (
                categories.find(cat => cat.id === activeCategory) && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {categories.find(cat => cat.id === activeCategory)?.description}
                  </p>
                )
              )}
            </motion.div>

            {/* Roadmaps Grid */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCategory}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredRoadmaps.length > 0 ? (
                  filteredRoadmaps.map((roadmap) => (
                    <motion.div
                      key={roadmap.id}
                      variants={fadeIn}
                      whileHover="hover"
                    >
                      <Link href={`/learning-roadmap/${roadmap.slug}`}>
                        <motion.div 
                          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full border border-gray-100"
                          variants={cardHover}
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(roadmap.level)}`}>
                                {roadmap.level.charAt(0).toUpperCase() + roadmap.level.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">{roadmap.timeToComplete}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                              {roadmap.title}
                            </h3>

                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                              {roadmap.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {roadmap.tags.slice(0, 2).map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {roadmap.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                  +{roadmap.tags.length - 2}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-purple-600 font-medium text-sm">View Roadmap</span>
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="col-span-full text-center py-12"
                    variants={fadeIn}
                  >
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps found</h3>
                    <p className="text-gray-600">Try adjusting your search or browse other categories.</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have advanced their careers with our structured learning paths.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link 
                href="/learning-roadmap/linux-admin"
                className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start with Linux Admin
              </Link>
              <Link 
                href="/learning-roadmap/devops-engineer"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Explore DevOps Path
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
