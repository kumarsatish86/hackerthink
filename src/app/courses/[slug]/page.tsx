'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { StructuredData, generateCourseStructuredData } from '@/components/SEO/StructuredData';

interface Chapter {
  id: string;
  title: string;
  content_type: string;
  duration: number;
  is_free_preview: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  requirements: string;
  what_will_learn: string;
  who_is_for: string;
  featured_image: string;
  author_id: string;
  author_name: string;
  level: string;
  duration: number;
  price: number;
  discount_price: number | null;
  is_featured: boolean;
  sections: Section[];
}

// Mock instructor data (would be fetched from API in production)
const instructorData = {
  bio: "Experienced Linux professional with over 10 years of industry experience. Specializes in system administration, DevOps practices, and cloud infrastructure.",
  image: "/images/instructor-avatar.jpg",
  credentials: ["Red Hat Certified Engineer", "AWS Certified Solutions Architect", "Kubernetes Administrator"],
  students: 15800,
  courses: 12,
  rating: 4.8
};

// Mock testimonials (would be fetched from API in production)
const testimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'DevOps Engineer',
    company: 'TechCorp',
    content: 'This course completely transformed my understanding of Linux. The hands-on exercises were particularly valuable.',
    rating: 5,
    date: '2023-08-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'System Administrator',
    company: 'CloudNet',
    content: 'Well-structured content that builds progressively. I appreciated the depth of knowledge shared throughout.',
    rating: 4,
    date: '2023-09-22'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Software Developer',
    company: 'CodeWorks',
    content: 'The perfect balance of theory and practical examples. I reference the material regularly in my daily work.',
    rating: 5,
    date: '2023-07-30'
  }
];

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'curriculum', 'instructor', or 'reviews'
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<Record<string, any> | null>(null);

  const slug = params?.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : '';

  useEffect(() => {
    fetchCourseDetails();
  }, [slug]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      // Use the public course detail API endpoint
      const response = await fetch(`/api/courses/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      
      const data = await response.json();
      setCourse(data.course);
      
      // Generate structured data when course data is available
      if (data.course) {
        const totalChapters = data.course.sections.reduce(
          (total: number, section: Section) => total + section.chapters.length, 0
        );
        
        setStructuredData(generateCourseStructuredData({
          title: data.course.title,
          description: data.course.description,
          slug: data.course.slug,
          author_name: data.course.author_name,
          level: data.course.level,
          price: data.course.price,
          discount_price: data.course.discount_price,
          duration: data.course.duration,
          featured_image: data.course.featured_image,
          requirements: data.course.requirements,
          what_will_learn: data.course.what_will_learn,
          sections_count: data.course.sections.length,
          total_chapters: totalChapters
        }));
      }
      
      // Expand the first section by default if any
      if (data.course.sections && data.course.sections.length > 0) {
        setExpandedSections([data.course.sections[0].id]);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    // In a real implementation, this would process payment and enroll the user
    if (!session) {
      // Redirect to sign in if not logged in
      router.push('/auth/signin?returnUrl=' + encodeURIComponent(`/courses/${slug}`));
      return;
    }
    
    try {
      setEnrolling(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to course learning page
      router.push(`/learn/${slug}`);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes) return 'Self-paced';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  const totalChapters = course?.sections.reduce(
    (total, section) => total + section.chapters.length, 0
  ) || 0;

  // Animation variants for Framer Motion
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Stagger animations for children elements
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-xl text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Course not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Add structured data */}
      {structuredData && <StructuredData data={structuredData} />}
      
      {/* Hero Section with Animated Elements */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-full h-full" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Animated Gradient Blobs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Course Info */}
            <motion.div variants={fadeIn} className="lg:w-7/12 xl:w-8/12">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' : 
                  course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                
                {course.is_featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
              </div>
              
              <motion.h1 
                className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200"
                variants={slideUp}
              >
                {course.title}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-indigo-100 mb-8 leading-relaxed"
                variants={slideUp}
              >
                {course.short_description}
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap items-center gap-6 text-indigo-100 mb-10"
                variants={staggerContainer}
              >
                <motion.div variants={slideUp} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/50 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Instructor</p>
                    <p className="font-medium">{course.author_name}</p>
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/50 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Duration</p>
                    <p className="font-medium">{formatDuration(course.duration)}</p>
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/50 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Structure</p>
                    <p className="font-medium">{course.sections.length} sections, {totalChapters} lessons</p>
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/50 flex items-center justify-center mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Last Updated</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="lg:hidden"
                variants={slideUp}
              >
                <EnrollmentCard 
                  course={course} 
                  handleEnroll={handleEnroll} 
                  enrolling={enrolling} 
                />
              </motion.div>
            </motion.div>
            
            {/* Desktop Enrollment Card */}
            <motion.div 
              variants={slideUp} 
              className="hidden lg:block lg:w-5/12 xl:w-4/12"
            >
              <EnrollmentCard 
                course={course} 
                handleEnroll={handleEnroll} 
                enrolling={enrolling} 
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8 -mt-6 relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="md:w-2/3">
            {/* Course Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
              <div className="flex justify-between border-b border-gray-200 overflow-x-auto no-scrollbar">
                <motion.button
                  onClick={() => setActiveTab('overview')}
                  className={`relative py-4 px-6 text-sm font-medium focus:outline-none transition-colors ${
                    activeTab === 'overview'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                >
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Overview
                  </div>
                  {activeTab === 'overview' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 w-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('curriculum')}
                  className={`relative py-4 px-6 text-sm font-medium focus:outline-none transition-colors ${
                    activeTab === 'curriculum'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                >
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Curriculum
                  </div>
                  {activeTab === 'curriculum' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 w-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('instructor')}
                  className={`relative py-4 px-6 text-sm font-medium focus:outline-none transition-colors ${
                    activeTab === 'instructor'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                >
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Instructor
                  </div>
                  {activeTab === 'instructor' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 w-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('reviews')}
                  className={`relative py-4 px-6 text-sm font-medium focus:outline-none transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                >
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Reviews
                  </div>
                  {activeTab === 'reviews' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 w-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.button>
              </div>
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <TabContent key="overview">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                      <div className="prose prose-indigo max-w-none">
                        <p className="text-gray-600 mb-6">{course.description}</p>
                        
                        {course.what_will_learn && (
                          <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {course.what_will_learn.split('\n').map((item, idx) => (
                                <div key={idx} className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-gray-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {course.requirements && (
                          <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                              {course.requirements.split('\n').map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {course.who_is_for && (
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Who This Course is For</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                              {course.who_is_for.split('\n').map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabContent>
                  )}
                  
                  {activeTab === 'curriculum' && (
                    <TabContent key="curriculum">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
                      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                        <div>
                          {course.sections.length} sections • {totalChapters} lessons • {formatDuration(course.duration)} total length
                        </div>
                        <button className="text-indigo-600 font-medium hover:text-indigo-800">
                          Expand All Sections
                        </button>
                      </div>
                      
                      {/* Sections accordion */}
                      <div className="space-y-4">
                        {course.sections.map((section) => (
                          <motion.div 
                            key={section.id} 
                            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3}}
                          >
                            {/* Section header */}
                            <motion.button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                              whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                            >
                              <div className="flex items-center">
                                <motion.div
                                  animate={{ rotate: expandedSections.includes(section.id) ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mr-2 text-gray-500"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </motion.div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{section.title}</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {section.chapters.length} lessons • {
                                      formatDuration(section.chapters.reduce((total, chapter) => total + (chapter.duration || 0), 0))
                                    }
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                            
                            {/* Section content */}
                            {expandedSections.includes(section.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="divide-y divide-gray-100">
                                  {section.chapters.map((chapter, index) => (
                                    <div
                                      key={chapter.id}
                                      className="flex justify-between items-center p-4 hover:bg-gray-50"
                                    >
                                      <div className="flex items-center">
                                        <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 text-sm">
                                          {index + 1}
                                        </span>
                                        <div>
                                          <h4 className="text-gray-900">{chapter.title}</h4>
                                          <div className="flex items-center mt-1 text-sm text-gray-500">
                                            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                              {chapter.content_type === 'text' ? (
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                              ) : (
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                              )}
                                            </svg>
                                            {chapter.content_type === 'text' ? 'Reading' : 'Video'} • {formatDuration(chapter.duration)}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {chapter.is_free_preview && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </TabContent>
                  )}
                  
                  {activeTab === 'instructor' && (
                    <TabContent key="instructor">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Your Instructor</h2>
                      
                      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start">
                          <div className="h-24 w-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4 sm:mb-0 sm:mr-6">
                            {course.author_name?.charAt(0) || 'I'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{course.author_name}</h3>
                            <p className="text-indigo-600 font-medium mb-3">Linux Expert & System Administrator</p>
                            
                            <div className="flex items-center mb-4">
                              <div className="flex items-center mr-4">
                                <svg className="h-5 w-5 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-gray-600">{instructorData.students.toLocaleString()} students</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">{instructorData.courses} courses</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600">{instructorData.bio}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Instructor Credentials</h3>
                        <ul className="space-y-3">
                          {instructorData.credentials.map((credential, idx) => (
                            <li key={idx} className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700">{credential}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabContent>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <TabContent key="reviews">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                        <div className="flex items-center mt-2 md:mt-0">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-gray-600">{instructorData.rating} course rating • {testimonials.length} reviews</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {testimonials.map((testimonial) => (
                          <motion.div 
                            key={testimonial.id} 
                            className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                                  {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                                  <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                                </div>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg 
                                    key={star} 
                                    className={`h-5 w-5 ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 italic">"{testimonial.content}"</p>
                            <p className="text-sm text-gray-500 mt-2">{new Date(testimonial.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </motion.div>
                        ))}
                      </div>
                    </TabContent>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Sidebar Components */}
          <div className="md:w-1/3">
            {/* Related Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Courses</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3 group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="h-16 w-16 flex-shrink-0 rounded bg-indigo-100"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Advanced Linux Administration</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              className={`h-3 w-3 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-500">(320)</span>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium mt-1">$59.99</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Achievement Card */}
            <motion.div 
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <h3 className="text-lg font-bold mb-2">Get Certified</h3>
                <p className="text-indigo-100 text-sm mb-4">Complete this course and earn a certificate of completion to showcase your skills</p>
                <div className="flex items-center">
                  <svg className="h-9 w-9 text-yellow-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="font-medium">Linux Certification</p>
                    <p className="text-xs text-indigo-200">Advance your career</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Animation wrapper component for tab content
function TabContent({ children, key }: { children: React.ReactNode, key: string }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Enrollment Card Component
function EnrollmentCard({ course, handleEnroll, enrolling }: { 
  course: Course, 
  handleEnroll: () => Promise<void>, 
  enrolling: boolean 
}) {
  // Get access to formatDuration and totalChapters
  const formatDuration = (minutes: number): string => {
    if (!minutes) return 'Self-paced';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  const totalChapters = course?.sections.reduce(
    (total, section) => total + section.chapters.length, 0
  ) || 0;

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Removed course preview image section */}
      
      <div className="p-6">
        {/* Price Display */}
        <div className="mb-6">
          {course.price > 0 ? (
            <div className="flex items-center">
              {course.discount_price ? (
                <>
                  <span className="text-gray-400 text-xl line-through mr-3">${course.price.toFixed(2)}</span>
                  <span className="text-4xl font-bold text-indigo-600">${course.discount_price.toFixed(2)}</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                    {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-indigo-600">${course.price.toFixed(2)}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-4xl font-bold text-green-600">Free</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                Limited Time
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {enrolling ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : course.price > 0 ? (
              <>Enroll Now</>
            ) : (
              <>Start Learning Now</>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Add to Wishlist
          </motion.button>
        </div>
        
        {/* Course Includes */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">This course includes:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{formatDuration(course.duration)} of on-demand video</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{totalChapters} downloadable resources</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Full lifetime access</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Access on mobile and desktop</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Certificate of completion</span>
            </li>
          </ul>
        </div>
        
        {/* Share Course */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Share this course:</span>
          <div className="flex space-x-2">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 