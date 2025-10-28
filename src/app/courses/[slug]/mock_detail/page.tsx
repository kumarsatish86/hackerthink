'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data for courses
const mockCourses = [
  {
    id: '1',
    slug: 'linux-fundamentals',
    title: 'Linux Fundamentals',
    description: 'Learn the basics of Linux operating system, command line, and system administration.',
    longDescription: 'This comprehensive course covers everything you need to know about Linux, from basic commands to advanced system administration. You will learn how to navigate the file system, work with permissions, manage processes, and configure services. By the end of this course, you will be comfortable using Linux for everyday tasks and administering Linux systems.',
    image: '/images/courses/linux-fundamentals.jpg',
    category: 'Linux',
    level: 'Beginner',
    duration: '12 hours',
    instructorName: 'John Smith',
    instructorBio: 'Linux expert with 15+ years of experience in system administration and teaching.',
    price: 49.99,
    modules: [
      {
        title: 'Introduction to Linux',
        lessons: [
          { title: 'What is Linux?', duration: '10 min' },
          { title: 'Linux Distributions', duration: '15 min' },
          { title: 'Installing Linux', duration: '20 min' },
        ],
      },
      {
        title: 'Basic Commands',
        lessons: [
          { title: 'Navigating the File System', duration: '25 min' },
          { title: 'File Operations', duration: '30 min' },
          { title: 'Text Editing with Vim and Nano', duration: '35 min' },
        ],
      },
      {
        title: 'System Administration',
        lessons: [
          { title: 'User Management', duration: '25 min' },
          { title: 'Package Management', duration: '30 min' },
          { title: 'Service Configuration', duration: '40 min' },
        ],
      },
    ],
  },
  {
    id: '2',
    slug: 'network-administration',
    title: 'Network Administration',
    description: 'Master the skills required to configure, manage, and troubleshoot network infrastructure.',
    longDescription: 'This course provides comprehensive coverage of network administration, including TCP/IP fundamentals, routing, switching, and network security. You will learn how to set up and maintain network infrastructure, troubleshoot connectivity issues, and implement security measures to protect your network.',
    image: '/images/courses/network-admin.jpg',
    category: 'Networking',
    level: 'Intermediate',
    duration: '20 hours',
    instructorName: 'Sarah Johnson',
    instructorBio: 'Network specialist with CCNA, CCNP certifications and 10+ years of industry experience.',
    price: 69.99,
    modules: [
      {
        title: 'Networking Fundamentals',
        lessons: [
          { title: 'OSI Model', duration: '20 min' },
          { title: 'TCP/IP Protocol Suite', duration: '25 min' },
          { title: 'IP Addressing and Subnetting', duration: '40 min' },
        ],
      },
      {
        title: 'Network Infrastructure',
        lessons: [
          { title: 'Switches and VLANs', duration: '35 min' },
          { title: 'Routing Fundamentals', duration: '45 min' },
          { title: 'Wireless Networking', duration: '30 min' },
        ],
      },
      {
        title: 'Network Security',
        lessons: [
          { title: 'Firewall Configuration', duration: '35 min' },
          { title: 'VPN Setup', duration: '30 min' },
          { title: 'Security Best Practices', duration: '25 min' },
        ],
      },
    ],
  },
];

export default function CourseDetail() {
  const params = useParams();
  const courseSlug = params.slug as string;
  
  const course = mockCourses.find((c) => c.slug === courseSlug);
  
  const [activeTab, setActiveTab] = useState('curriculum');
  
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-8">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Browse All Courses
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/3 bg-gray-200 relative">
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
              <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="p-8 md:w-2/3">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
              {course.category} • {course.level}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <div className="flex items-center mr-6">
                <svg className="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{course.instructorName}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg mb-4 sm:mb-0 sm:mr-4"
              >
                Enroll for ${course.price}
              </button>
              <button
                className="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-3 px-6 rounded-lg border border-indigo-600"
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'curriculum'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                activeTab === 'instructor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Instructor
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'curriculum' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-900">{module.title}</h3>
                      <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{lesson.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Overview</h2>
              <p className="text-gray-600 mb-6">{course.longDescription}</p>
            </div>
          )}
          
          {activeTab === 'instructor' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Instructor</h2>
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mr-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{course.instructorName}</h3>
                </div>
              </div>
              <p className="text-gray-600">{course.instructorBio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 