'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import CommentsSection from '../../../components/comments/CommentsSection';
import LearningPathDisplay from '../../../components/LearningPathDisplay';
import QuizDisplay from '../../../components/QuizDisplay';
import UsageExamplesDisplay from '../../../components/UsageExamplesDisplay';
import TermContentEditor from '../../../components/TermContentEditor';
import { TermData, RelatedTerm, TermPageClientProps } from '@/types/term';

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

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// New animation variants for hero elements
const titleAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20,
      delay: 0.2 
    } 
  }
};

// Modified floating animation for more dramatic effect
const floatingAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [0, -20, 0], 
    rotateZ: [0, 2, 0, -2, 0],
    transition: { 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.5 },
  animate: { 
    scale: [1, 1.1, 1], 
    opacity: [0.5, 0.9, 0.5],
    transition: { 
      duration: 2.5, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

// New text reveal animation
const letterRevealAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: 0.3,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
};

// New glow animation
const glowAnimation = {
  initial: { 
    filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))' 
  },
  animate: { 
    filter: [
      'drop-shadow(0 0 2px rgba(255, 255, 255, 0.2))',
      'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
      'drop-shadow(0 0 2px rgba(255, 255, 255, 0.2))'
    ],
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

// New scale animation
const scaleAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.02, 0.98, 1], 
    transition: { 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

export default function TermPageClient({ term, relatedTerms }: TermPageClientProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('definition');
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { data: session } = useSession();
  
  // References for scrolling
  const definitionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation trigger on scroll
  const [definitionRefView, definitionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [heroRefView, heroInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Copy to clipboard function
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Scroll to definition
  const scrollToDefinition = () => {
    definitionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Split term into individual letters for animation
  const termLetters = term.term.split('');

  // Format dates for display
  const updatedDate = new Date(term.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const createdDate = term.created_at ? new Date(term.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : updatedDate;

  return (
    <div className="bg-white min-h-screen overflow-hidden" ref={containerRef}>
      {/* Header with parallax and motion effects */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-900"
        style={{ 
          height: '40vh', 
          minHeight: '300px',
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
        }}
      >
        {/* Enhanced Hero Section */}
        <div 
          ref={(el) => {
            if (el) {
              heroRefView(el);
              containerRef.current = el;
            }
          }}
          className="relative bg-gradient-to-br from-blue-900 via-blue-600 to-blue-500 text-white overflow-hidden"
          style={{ 
            minHeight: "45vh",
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(96, 165, 250, 0.6), rgba(30, 64, 175, 0.8), rgba(30, 58, 138, 1))`
          }}
        >
          {/* Interactive Spotlight */}
          <div 
            className="absolute w-96 h-96 rounded-full pointer-events-none mix-blend-screen filter blur-3xl opacity-30"
            style={{ 
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(59,130,246,0) 70%)',
              top: `calc(${mousePosition.y * 100}% - 48px)`, 
              left: `calc(${mousePosition.x * 100}% - 48px)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Larger animated blobs with more vibrant colors */}
            <motion.div 
              className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
              animate={{ 
                x: [0, 30, 0], 
                y: [0, 25, 0],
              }} 
              transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute top-1/3 right-1/3 w-128 h-128 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
              animate={{ 
                x: [0, -40, 0], 
                y: [0, 20, 0],
              }} 
              transition={{ 
                duration: 18, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-40 -right-40 w-112 h-112 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
              animate={{ 
                x: [0, -30, 0], 
                y: [0, -40, 0],
              }} 
              transition={{ 
                duration: 16, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            
            {/* New purple accent blob */}
            <motion.div 
              className="absolute top-3/4 left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
              animate={{ 
                x: [0, 20, 0], 
                y: [0, -30, 0],
              }} 
              transition={{ 
                duration: 14, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          {/* Floating Particles - more particles with better animations */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, index) => (
              <motion.div
                key={index}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 8 + 2 + "px",
                  height: Math.random() * 8 + 2 + "px",
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.6 + 0.2
                }}
                initial={{ y: 0 }}
                animate={{ 
                  y: [-30, 30, -30], 
                  x: [Math.random() * 20, Math.random() * -20, Math.random() * 20]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
          
          {/* Main Content Container */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
            <motion.div 
              className="flex flex-col md:flex-row items-center md:items-start justify-between"
              style={{
                transform: `translateY(${scrollY * 0.2}px)`,
              }}
            >
              {/* Left Content: Breadcrumb and Title */}
              <div className="w-full md:w-2/3 mb-16 md:mb-0 text-center md:text-left">
                <motion.nav 
                  className="flex flex-wrap justify-center md:justify-start text-sm mb-8" 
                  aria-label="Breadcrumb"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Link href="/" className="text-blue-100 hover:text-white transition-colors">Home</Link>
                    <svg className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <Link href="/term" className="text-blue-100 hover:text-white transition-colors">Glossary</Link>
                    <svg className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white truncate">{term.term}</span>
                  </div>
                </motion.nav>
                
                {/* Animated Text Reveal for Title */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight inline-flex flex-wrap">
                    {termLetters.map((letter, index) => (
                      <motion.span
                        key={index}
                        custom={index}
                        variants={letterRevealAnimation}
                        initial="hidden"
                        animate="visible"
                        className="inline-block relative"
                      >
                        {letter === ' ' ? <span>&nbsp;</span> : letter}
                      </motion.span>
                    ))}
                  </h1>
                </div>
                
                <motion.div 
                  className="flex flex-wrap justify-center md:justify-start gap-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <motion.span 
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {term.category}
                  </motion.span>
                  <motion.span 
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 bg-opacity-90 text-white shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(79, 70, 229, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Technical Term
                  </motion.span>
                </motion.div>
                
                <motion.p
                  className="text-blue-50 text-lg max-w-xl mb-10 hidden md:block drop-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  Explore the definition, examples, and resources related to this important concept in {term.category}.
                </motion.p>
                
                {/* New animated action buttons */}
                <motion.div
                  className="hidden md:flex gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <motion.button 
                    onClick={scrollToDefinition}
                    className="inline-flex items-center px-6 py-3 border-2 border-white rounded-lg text-sm font-medium text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-blue-700 transition-all shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Start Learning
                  </motion.button>
                </motion.div>
              </div>
              
              {/* Right Content: Animated Graphic and Quick Actions */}
              <div className="w-full md:w-1/3 flex flex-col items-center md:items-end">
                {/* 3D-like floating card with animation */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-60 backdrop-blur-lg rounded-2xl p-8 mb-10 border border-blue-400 border-opacity-30 shadow-2xl transform perspective-1000"
                  variants={floatingAnimation}
                  initial="initial"
                  animate="animate"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * 10}deg) rotateY(${(mousePosition.x - 0.5) * -10}deg)`,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-36 h-36 relative mx-auto">
                    <motion.div 
                      className="absolute inset-0 bg-blue-400 rounded-full"
                      variants={pulseAnimation}
                      initial="initial"
                      animate="animate"
                    />
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      variants={glowAnimation}
                      initial="initial"
                      animate="animate"
                    >
                      <svg className="h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </motion.div>
                  </div>
                  
                  {/* Interactive stat counter */}
                  <motion.div 
                    className="mt-6 text-center text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <div className="text-3xl font-bold mb-1">{Math.floor(Math.random() * 800) + 200}</div>
                    <div className="text-sm text-blue-100">Learners exploring this term</div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap justify-center md:justify-end gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <motion.button 
                    onClick={scrollToDefinition}
                    className="inline-flex items-center px-5 py-3 bg-white rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors shadow-xl"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Read Definition
                  </motion.button>
                  <motion.button 
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-5 py-3 border border-white border-opacity-50 rounded-lg text-sm font-medium text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-blue-700 transition-all shadow-xl"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copySuccess ? 'Copied!' : 'Share Term'}
                  </motion.button>
                </motion.div>
            </div>
            </motion.div>
            
            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4], 
                y: [0, 10, 0] 
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex flex-col items-center text-white">
                <span className="text-sm mb-2">Scroll to learn</span>
                <svg className="w-6 h-6 animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </motion.div>
            </div>
          
          {/* Enhanced Wavy Divider at Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-4 bg-white"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <motion.div 
              className="lg:col-span-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              ref={definitionRef}
            >
              {/* Content Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('definition')}
                    className={`${
                      activeTab === 'definition'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Definition
                  </button>
                  <button
                    onClick={() => setActiveTab('examples')}
                    className={`${
                      activeTab === 'examples'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Examples
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`${
                      activeTab === 'resources'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Resources
                  </button>
                </nav>
              </div>

              {/* Tab Content with Animations */}
              <div ref={definitionRefView} className="mb-12">
                <AnimatePresence mode="wait">
                  {activeTab === 'definition' && (
                    <motion.div
                      key="definition"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="prose prose-lg max-w-none prose-blue"
                    >
                      <div className="flex items-start">
                        <div className="flex-grow">
                          <TermContentEditor 
                            termId={term.id} 
                            initialDefinition={term.definition}
                            initialUsageExamples={term.usage_examples || ''}
                            onSave={(updatedTerm) => {
                              // This would typically update the parent state
                              console.log('Term updated:', updatedTerm);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'examples' && (
                    <motion.div
                      key="examples"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">Usage Examples</h3>
                        <p className="text-gray-700 mb-4">
                          Examples help illustrate how {term.term} is used in practical situations.
                        </p>
                        
                        {term.usage_examples ? (
                          <UsageExamplesDisplay data={term.usage_examples} />
                        ) : (
                          <p className="text-gray-500 italic">No usage examples available.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'resources' && (
                    <motion.div
                      key="resources"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">Additional Resources</h3>
                        <p className="text-gray-700 mb-4">
                          Learn more about {term.term} through these helpful resources.
                        </p>
                        
                        <ul className="space-y-4">
                          {term.official_docs_url ? (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
                              <a href={term.official_docs_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-medium">Official Documentation</span>
                              </a>
                            </li>
                          ) : (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100 opacity-50">
                              <span className="flex items-center text-gray-500">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-medium">Official Documentation (Not Available)</span>
                              </span>
                            </li>
                          )}
                          
                          {term.video_tutorial_url ? (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
                              <a href={term.video_tutorial_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Video Tutorial</span>
                              </a>
                            </li>
                          ) : (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100 opacity-50">
                              <span className="flex items-center text-gray-500">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Video Tutorial (Not Available)</span>
                              </span>
                            </li>
                          )}
                          
                          {term.related_article_url ? (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
                              <a href={term.related_article_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span className="font-medium">Related Article</span>
                              </a>
                            </li>
                          ) : (
                            <li className="bg-white rounded-lg shadow-sm p-4 border border-blue-100 opacity-50">
                              <span className="flex items-center text-gray-500">
                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                <span className="font-medium">Related Article (Not Available)</span>
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Term Difficulty Level */}
              <div className="mb-10 bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Level</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    {term.difficulty_level === 'Beginner' && <div className="bg-blue-600 h-4 rounded-full w-1/3"></div>}
                    {term.difficulty_level === 'Intermediate' && <div className="bg-blue-600 h-4 rounded-full w-2/3"></div>}
                    {term.difficulty_level === 'Advanced' && <div className="bg-blue-600 h-4 rounded-full w-full"></div>}
                    {!term.difficulty_level && <div className="bg-blue-600 h-4 rounded-full w-1/3"></div>}
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-700">{term.difficulty_level || 'Beginner'}</span>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  This term is considered {term.difficulty_level?.toLowerCase() || 'beginner level'} in {term.category}.
                </p>
              </div>

              {/* Learning Path */}
              {term.learning_path && (
                <LearningPathDisplay data={term.learning_path} />
              )}
              
              {/* Test Your Knowledge Quiz */}
              {term.knowledge_test && (
                <QuizDisplay data={term.knowledge_test} />
              )}
              
              {/* Metadata and Share Section */}
              <div className="mt-12 border-t border-gray-100 pt-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Published: {createdDate}
                      {updatedDate !== createdDate && (
                        <span className="ml-4 flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Updated: {updatedDate}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex space-x-4">
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        href="#" 
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                      </motion.a>
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        href="#" 
                        className="text-blue-700 hover:text-blue-800 transition-colors"
                      >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                      </motion.a>
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className="text-blue-800 hover:text-blue-900 transition-colors" 
                      >
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                      </motion.a>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyToClipboard}
                        className="text-gray-500 hover:text-gray-700 transition-colors" 
                      >
                        <span className="sr-only">Copy Link</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="lg:sticky lg:top-6 space-y-8">
                {/* Animated Info Card */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-sm overflow-hidden"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 py-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 h-10 w-10 rounded-full flex items-center justify-center text-white">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Quick Info</h3>
            </div>
          </div>

                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-sm font-medium text-gray-500">Category</span>
                        <span className="text-sm font-medium text-gray-900">{term.category}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-sm font-medium text-gray-500">Added on</span>
                        <span className="text-sm font-medium text-gray-900">{createdDate}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-500">Last updated</span>
                        <span className="text-sm font-medium text-gray-900">{updatedDate}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Related Terms Section */}
              {relatedTerms.length > 0 && (
                  <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                      <h3 className="text-lg font-medium text-white">Related Terms</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {relatedTerms.map((related) => (
                        <motion.li 
                          key={related.id}
                          whileHover={{ 
                            backgroundColor: "rgba(243, 244, 246, 1)",
                            transition: { duration: 0.2 }
                          }}
                        >
                          <Link 
                            href={`/term/${related.slug}`} 
                            className="block transition-colors duration-150"
                          >
                            <div className="px-6 py-4">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-900">{related.term}</p>
                                <motion.span 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {related.category}
                                </motion.span>
                              </div>
                            </div>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                    {relatedTerms.length <= 2 && (
                      <div className="px-6 py-4 bg-gray-50">
                        <p className="text-sm text-gray-500">
                          Explore more terms in our extensive IT glossary.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Browse More Terms */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-sm overflow-hidden text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.4)" }}
                >
                  <div className="px-6 py-6">
                    <h3 className="text-lg font-medium mb-2">Explore More</h3>
                    <p className="text-blue-100 mb-4">
                      Discover more terms in our comprehensive IT glossary.
                    </p>
                    <div className="space-y-3">
                  <Link
                    href={`/term?category=${encodeURIComponent(term.category)}`}
                        className="block w-full text-center px-4 py-2 border border-blue-300 rounded-lg text-blue-50 bg-blue-700/30 backdrop-blur-sm hover:bg-blue-700/50 transition-colors"
                      >
                        More {term.category} Terms
                      </Link>
                      <Link
                        href="/term"
                        className="block w-full text-center px-4 py-2 border border-transparent rounded-lg text-blue-900 bg-white hover:bg-blue-50 transition-colors"
                      >
                        Browse All Terms
                  </Link>
                </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-50 py-12 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <CommentsSection contentId={term.id} contentType="term" />
          </div>
        </div>

        {/* Floating "Back to Top" Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
          </svg>
        </motion.button>

        {/* Copy Success Notification */}
        <AnimatePresence>
          {copySuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link copied to clipboard!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
