'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function NewHomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      title: 'Interactive Courses',
      description: 'Expert-led courses with hands-on exercises to master Linux, DevOps, Cloud, and more',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Hands-on Labs',
      description: 'Practice in real environments to build practical skills and solve real-world challenges',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      title: 'Technical Articles',
      description: 'In-depth, up-to-date articles on the latest IT trends, tools, and best practices',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      title: 'Learning Paths',
      description: 'Structured learning journeys to help you progress from beginner to expert in your chosen field',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Linux System Administration Masterclass',
      description: 'Master Linux server management, security, and performance optimization',
      image: '/images/courses/linux-admin.jpg',
      category: 'Linux',
      level: 'Intermediate',
      students: 1240,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Docker & Kubernetes: The Complete Guide',
      description: 'Learn containerization and orchestration for modern application deployment',
      image: '/images/courses/docker-kubernetes.jpg',
      category: 'DevOps',
      level: 'Intermediate',
      students: 980,
      rating: 4.9,
    },
    {
      id: 3,
      title: 'AWS Certified Solutions Architect',
      description: 'Comprehensive preparation for the AWS Solutions Architect certification',
      image: '/images/courses/aws-architect.jpg',
      category: 'Cloud',
      level: 'Advanced',
      students: 1560,
      rating: 4.7,
    },
  ];

  const stats = [
    { label: 'Courses', value: '50+' },
    { label: 'Students', value: '9,500+' },
    { label: 'Articles', value: '200+' },
    { label: 'Rating', value: '4.8' },
  ];

  // Calculate mouse parallax effect
  const moveX = mousePosition.x * 20;
  const moveY = mousePosition.y * 20;

  // Hero section content
  const heroContent = {
    mainHeading: "Unlock Your IT Career Potential",
    subHeading: "Hands-on Linux & Cloud Skills",
    description: "Master in-demand technologies through practical exercises, real-world projects, and expert-led training. From command line to cloud deployment, we've got you covered.",
    metrics: [
      { value: "96%", label: "Success rate" },
      { value: "50+", label: "Industry experts" },
      { value: "24/7", label: "Support access" }
    ],
    valueProps: [
      "Job-ready skills in Linux, DevOps & Cloud",
      "Practical projects with real-world scenarios",
      "Industry-recognized certification paths",
      "Personalized learning experience"
    ]
  };

  return (
    <div className="bg-white w-full overflow-hidden">
      {/* Enhanced Hero section with better content */}
      <div ref={heroRef} className="relative w-full h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large animated gradient circles */}
          <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-20 w-[25rem] h-[25rem] rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-40 right-20 w-[35rem] h-[35rem] rounded-full bg-gradient-to-r from-indigo-400/30 to-purple-700/30 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Interactive particles that follow mouse movement */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute w-2 h-2 bg-indigo-300 rounded-full opacity-70 blur-sm animate-particle1" style={{ transform: `translate(${moveX * -1}px, ${moveY * -1}px)` }}></div>
            <div className="absolute w-3 h-3 bg-purple-300 rounded-full opacity-70 blur-sm animate-particle2" style={{ transform: `translate(${moveX * -2}px, ${moveY * -2}px)` }}></div>
            <div className="absolute w-4 h-4 bg-blue-300 rounded-full opacity-70 blur-sm animate-particle3" style={{ transform: `translate(${moveX * -3}px, ${moveY * -1.5}px)` }}></div>
            <div className="absolute w-2 h-2 bg-white rounded-full opacity-70 blur-sm animate-particle4" style={{ transform: `translate(${moveX * -2.5}px, ${moveY * -2.5}px)` }}></div>
            <div className="absolute w-1 h-1 bg-indigo-200 rounded-full opacity-70 blur-sm animate-particle5" style={{ transform: `translate(${moveX * -3.5}px, ${moveY * -2}px)` }}></div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-float"></div>
            <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-indigo-300 rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-indigo-300 rounded-full opacity-60 animate-float" style={{ animationDelay: '4s' }}></div>
            
            {/* Additional floating elements */}
            <div className="absolute top-1/5 right-1/4 w-24 h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-xl animate-float-reverse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-xl animate-float-reverse" style={{ animationDelay: '3s' }}></div>
          </div>
          
          {/* Animated code lines in background */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-px w-2/3 bg-indigo-200 absolute top-1/4 animate-expand-line"></div>
            <div className="h-px w-1/2 bg-indigo-200 absolute top-1/3 right-0 animate-expand-line" style={{ animationDelay: '0.5s' }}></div>
            <div className="h-px w-3/4 bg-indigo-200 absolute top-1/2 animate-expand-line" style={{ animationDelay: '1s' }}></div>
            <div className="h-px w-1/3 bg-indigo-200 absolute top-2/3 right-0 animate-expand-line" style={{ animationDelay: '1.5s' }}></div>
            <div className="h-px w-2/5 bg-indigo-200 absolute top-3/4 animate-expand-line" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }}></div>
          
          {/* Additional animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/0 via-indigo-900/0 to-indigo-900/80"></div>
        </div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center z-10 h-full">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Updated hero content */}
            <div className="z-10 transform transition-all duration-1000" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white relative">
                  <span className="block animate-slideInLeft" style={{ animationDelay: '0.3s' }}>{heroContent.mainHeading}</span>
                  <span className="block mt-3">
                    <span className="animate-gradient-text bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent">{heroContent.subHeading}</span>
                  </span>
                </h1>
              </div>
              
              <p className="mt-6 text-xl leading-relaxed text-indigo-100 max-w-lg animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                {heroContent.description}
              </p>
              
              {/* Value propositions with checkmarks */}
              <div className="mt-8 space-y-3 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
                {heroContent.valueProps.map((prop, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-indigo-100">{prop}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-5 animate-fadeIn" style={{ animationDelay: '1.2s' }}>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 shadow-lg hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <span className="mr-2 transform group-hover:rotate-12 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </span>
                  <span>Start Learning Now</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 border border-indigo-300 text-base font-medium rounded-xl text-white hover:bg-indigo-800/30 transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <span className="mr-2 transform group-hover:rotate-12 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Watch Demo</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
              
              {/* Key metrics */}
              <div className="mt-12 grid grid-cols-3 gap-x-8 animate-fadeIn" style={{ animationDelay: '1.4s' }}>
                {heroContent.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white">{metric.value}</div>
                    <div className="text-sm text-indigo-300">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right side - Interactive demo */}
            <div className="relative z-10 transform transition-all duration-1000" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 shadow-2xl animate-float-slow animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                <div className="bg-gradient-to-br from-indigo-800/50 to-purple-800/50 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3)_0,rgba(255,255,255,0)_60%)]"></div>
                  
                  {/* Animated dots in the background */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  </div>
                  
                  <div className="relative p-6 md:p-8">
                    <div className="w-full">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-white/10 backdrop-blur-md mb-4 hover:bg-white/20 transition-colors duration-300 group">
                          <svg className="h-8 w-8 text-white group-hover:text-indigo-200 transition-colors duration-300 transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white">Interactive Learning</h3>
                        <p className="text-indigo-200 mt-1">Try our hands-on Linux environment</p>
                      </div>
                      
                      {/* Code snippet example with typing animation */}
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 mb-6 shadow-xl relative overflow-hidden group">
                        <div className="flex items-center mb-2">
                          <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                          <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                          <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="typing-animation">
                          <span className="text-purple-400">$</span> mkdir my-project<br/>
                          <span className="text-purple-400">$</span> cd my-project<br/>
                          <span className="text-purple-400">$</span> docker-compose up -d<br/>
                          <span className="animate-blink">_</span>
                        </div>
                        
                        {/* Hover effect - simulated execution */}
                        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                          <div className="text-green-400 animate-pulse">
                            <span className="block text-center mb-2">[ Click to Try Live Terminal ]</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Course preview cards */}
                      <div className="space-y-3 mb-6">
                        <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md bg-blue-600/30 flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">Linux System Administration</div>
                              <div className="text-xs text-indigo-300 flex items-center">
                                <span className="flex items-center">
                                  <svg className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  4.9
                                </span>
                                <span className="mx-2">•</span>
                                <span>Bestseller</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md bg-green-600/30 flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">Docker & Kubernetes</div>
                              <div className="text-xs text-indigo-300 flex items-center">
                                <span className="flex items-center">
                                  <svg className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  4.8
                                </span>
                                <span className="mx-2">•</span>
                                <span>New</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Students counter */}
                      <div className="bg-indigo-900/50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex -space-x-2 mr-3">
                            <div className="h-6 w-6 rounded-full bg-blue-500 border border-indigo-800"></div>
                            <div className="h-6 w-6 rounded-full bg-green-500 border border-indigo-800"></div>
                            <div className="h-6 w-6 rounded-full bg-yellow-500 border border-indigo-800"></div>
                            <div className="h-6 w-6 rounded-full bg-red-500 border border-indigo-800 flex items-center justify-center">
                              <span className="text-xs text-white font-medium">+</span>
                            </div>
                          </div>
                          <div className="text-sm text-indigo-200">9,500+ students learning</div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Animated badges floating around */}
              <div className="absolute -top-5 -right-5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-full px-3 py-1 animate-float opacity-90 shadow-lg backdrop-blur-sm">
                Expert Instructors
              </div>
              <div className="absolute -bottom-3 left-1/4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs rounded-full px-3 py-1 animate-float opacity-90 shadow-lg backdrop-blur-sm" style={{ animationDelay: '1s' }}>
                24/7 Support
              </div>
              <div className="absolute top-1/2 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs rounded-full px-3 py-1 animate-float opacity-90 shadow-lg backdrop-blur-sm" style={{ animationDelay: '2s' }}>
                Hands-on Labs
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <span className="text-white text-sm font-medium mb-2">Explore Courses</span>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 w-full">
          <svg className="w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 65C480 50 600 40 720 45C840 50 960 70 1080 75C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Stats Section - Modern cards with hover effects */}
      <div className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="p-6 relative z-10">
                  <dt className="text-base font-medium text-indigo-800 group-hover:text-white transition-colors duration-300">{stat.label}</dt>
                  <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                    <div className="flex items-baseline text-2xl font-semibold text-indigo-600 group-hover:text-white transition-colors duration-300">
                      {stat.value}
                    </div>
                  </dd>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features section with interactive cards */}
      <div className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Learning Experience</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to excel in tech
            </p>
            <p className="mt-4 text-xl text-gray-500">
              Our platform combines expert content, hands-on practice, and community support to give you a complete learning experience.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="relative group bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5 group-hover:bg-white group-hover:text-indigo-500 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="mt-3 text-base text-gray-500 group-hover:text-white/90 transition-colors duration-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Popular Courses Section with modern cards */}
      <div className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Top-Rated Courses</h2>
              <p className="mt-2 text-lg text-gray-600">Join thousands of students learning in-demand IT skills</p>
            </div>
            <Link
              href="/courses"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
            >
              Browse all courses
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {popularCourses.map((course) => (
              <div key={course.id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Course image with overlay on hover */}
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-600 flex items-center justify-center z-10 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                      <Link href={`/courses/${course.id}`} className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                        View Course
                      </Link>
                    </div>
                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-800' : 
                        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {course.rating}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.students.toLocaleString()}
                      </span>
                    </div>
                    
                    <Link href={`/courses/${course.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 mb-3">
                        {course.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <Link
                      href={`/courses/${course.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0 md:max-w-xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to accelerate your IT career?
            </h2>
            <p className="mt-4 text-xl text-indigo-100">
              Join thousands of IT professionals who are advancing their careers with LinuxConcept.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-lg transition-all duration-300"
            >
              Get Started Free
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-all duration-300"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 