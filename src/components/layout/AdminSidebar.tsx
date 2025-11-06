'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [productUtilityOpen, setProductUtilityOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };
  
  // Auto-expand only the section that contains the active page
  useEffect(() => {
    const contentPaths = ['/admin/content/articles', '/admin/content/news', '/admin/content/glossary', '/admin/content/web-stories', '/admin/content/commands'];
    const studyPaths = ['/admin/content/tutorials', '/admin/content/courses', '/admin/content/quizzes', '/admin/content/lab-exercises', '/admin/content/scripts', '/admin/content/roadmaps'];
    const productUtilityPaths = ['/admin/content/products', '/admin/content/models', '/admin/content/datasets', '/admin/content/tools'];
    const socialPaths = ['/admin/content/interviews', '/admin/forum'];
    
    const checkPath = (path: string) => {
      return pathname === path || pathname?.startsWith(path + '/');
    };
    
    const hasActiveContent = contentPaths.some(path => checkPath(path));
    const hasActiveStudy = studyPaths.some(path => checkPath(path));
    const hasActiveProductUtility = productUtilityPaths.some(path => checkPath(path));
    const hasActiveSocial = socialPaths.some(path => checkPath(path));
    
    // Only open the dropdown that contains the active page
    setContentOpen(hasActiveContent);
    setStudyOpen(hasActiveStudy);
    setProductUtilityOpen(hasActiveProductUtility);
    setSocialOpen(hasActiveSocial);
  }, [pathname]);

  return (
    <div className={`h-screen bg-gray-900 text-white ${expanded ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-800">
        {expanded ? (
          <h1 className="text-lg font-bold">Admin Panel</h1>
        ) : (
          <h1 className="text-lg font-bold">AP</h1>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md hover:bg-gray-700"
        >
          {expanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {/* Dashboard */}
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/dashboard') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Dashboard</span>}
            </Link>
          </li>

          {/* Content Management Section Header */}
          {expanded && (
            <li className="px-4 py-1 text-xs text-gray-400 uppercase font-semibold mt-4 mb-1">
              Content Management
            </li>
          )}

          {/* Content Dropdown */}
          <li>
            <button
              onClick={() => {
                if (contentOpen) {
                  setContentOpen(false);
                } else {
                  setContentOpen(true);
                  setStudyOpen(false); // Close Study when opening Content
                  setProductUtilityOpen(false); // Close Product/Utility when opening Content
                  setSocialOpen(false); // Close Social when opening Content
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-800 ${contentOpen ? 'bg-gray-800' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {expanded && <span className="ml-3 text-sm font-medium">Content</span>}
              </div>
              {expanded && (
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {contentOpen && expanded && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {/* Articles */}
                <li>
                  <Link
                    href="/admin/content/articles"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/articles') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className="ml-3 text-sm">Articles</span>
                  </Link>
                </li>

                {/* News */}
                <li>
                  <Link
                    href="/admin/content/news"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/news') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className="ml-3 text-sm">News</span>
                  </Link>
                </li>

                {/* Glossary */}
                <li>
                  <Link
                    href="/admin/content/glossary"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/glossary') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="ml-3 text-sm">Glossary</span>
                  </Link>
                </li>

                {/* Web Stories */}
                <li>
                  <Link
                    href="/admin/content/web-stories"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/web-stories') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <span className="ml-3 text-sm">Web Stories</span>
                  </Link>
                </li>

                {/* Commands */}
                <li>
                  <Link
                    href="/admin/content/commands"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/commands') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-3 text-sm">Commands</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Study Dropdown */}
          <li>
            <button
              onClick={() => {
                if (studyOpen) {
                  setStudyOpen(false);
                } else {
                  setStudyOpen(true);
                  setContentOpen(false); // Close Content when opening Study
                  setProductUtilityOpen(false); // Close Product/Utility when opening Study
                  setSocialOpen(false); // Close Social when opening Study
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-800 ${studyOpen ? 'bg-gray-800' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {expanded && <span className="ml-3 text-sm font-medium">Study</span>}
              </div>
              {expanded && (
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${studyOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {studyOpen && expanded && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {/* Tutorials */}
                <li>
                  <Link
                    href="/admin/content/tutorials"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/tutorials') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="ml-3 text-sm">Tutorials</span>
                  </Link>
                </li>

                {/* Courses */}
                <li>
                  <Link
                    href="/admin/content/courses"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/courses') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="ml-3 text-sm">Courses</span>
                  </Link>
                </li>

                {/* Quizzes */}
                <li>
                  <Link
                    href="/admin/content/quizzes"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/quizzes') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="ml-3 text-sm">Quizzes</span>
                  </Link>
                </li>

                {/* Lab Exercises */}
                <li>
                  <Link
                    href="/admin/content/lab-exercises"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/lab-exercises') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="ml-3 text-sm">Lab Exercises</span>
                  </Link>
                </li>

                {/* Scripts */}
                <li>
                  <Link
                    href="/admin/content/scripts"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/scripts') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-3 text-sm">Scripts</span>
                  </Link>
                </li>

                {/* Roadmaps (renamed from Learning Roadmaps) */}
                <li>
                  <Link
                    href="/admin/content/roadmaps"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/roadmaps') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="ml-3 text-sm">Roadmaps</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Product/Utility Dropdown */}
          <li>
            <button
              onClick={() => {
                if (productUtilityOpen) {
                  setProductUtilityOpen(false);
                } else {
                  setProductUtilityOpen(true);
                  setContentOpen(false); // Close Content when opening Product/Utility
                  setStudyOpen(false); // Close Study when opening Product/Utility
                  setSocialOpen(false); // Close Social when opening Product/Utility
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-800 ${productUtilityOpen ? 'bg-gray-800' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {expanded && <span className="ml-3 text-sm font-medium">Product/Utility</span>}
              </div>
              {expanded && (
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${productUtilityOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {productUtilityOpen && expanded && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {/* Products */}
                <li>
                  <Link
                    href="/admin/content/products"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/products') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="ml-3 text-sm">Products</span>
                  </Link>
                </li>

                {/* AI Models */}
                <li>
                  <Link
                    href="/admin/content/models"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/models') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="ml-3 text-sm">AI Models</span>
                  </Link>
                </li>

                {/* AI Datasets */}
                <li>
                  <Link
                    href="/admin/content/datasets"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/datasets') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                    <span className="ml-3 text-sm">AI Datasets</span>
                  </Link>
                </li>

                {/* Tools */}
                <li>
                  <Link
                    href="/admin/content/tools"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/tools') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="ml-3 text-sm">Tools</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Taxonomy */}
          <li>
            <Link
              href="/admin/taxonomy"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/taxonomy') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Taxonomy</span>}
            </Link>
          </li>

          {/* Social Dropdown */}
          <li>
            <button
              onClick={() => {
                if (socialOpen) {
                  setSocialOpen(false);
                } else {
                  setSocialOpen(true);
                  setContentOpen(false); // Close Content when opening Social
                  setStudyOpen(false); // Close Study when opening Social
                  setProductUtilityOpen(false); // Close Product/Utility when opening Social
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-gray-800 ${socialOpen ? 'bg-gray-800' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {expanded && <span className="ml-3 text-sm font-medium">Social</span>}
              </div>
              {expanded && (
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${socialOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {socialOpen && expanded && (
              <ul className="ml-4 mt-1 space-y-0.5">
                {/* Interviews */}
                <li>
                  <Link
                    href="/admin/content/interviews"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/content/interviews') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="ml-3 text-sm">Interviews</span>
                  </Link>
                </li>

                {/* Community */}
                <li>
                  <Link
                    href="/admin/forum"
                    className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/forum') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="ml-3 text-sm">Community</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Users & Settings Section */}
          {expanded && (
            <li className="px-4 py-1 text-xs text-gray-400 uppercase font-semibold mt-4 mb-1">
              Administration
            </li>
          )}

          {/* Users */}
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/users') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Users</span>}
            </Link>
          </li>

          {/* Roles */}
          <li>
            <Link
              href="/admin/roles"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/roles') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Roles</span>}
            </Link>
          </li>

          {/* Media */}
          <li>
            <Link
              href="/admin/media"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/media') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Media</span>}
            </Link>
          </li>

          {/* Comments */}
          <li>
            <Link
              href="/admin/comments"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/comments') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Comments</span>}
            </Link>
          </li>

          {/* Integrations */}
          <li>
            <Link
              href="/admin/integrations"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/integrations') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Integrations</span>}
            </Link>
          </li>

          {/* Contact Inquiries */}
          <li>
            <Link
              href="/admin/contact"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/contact') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Contact Inquiries</span>}
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/settings') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">Settings</span>}
            </Link>
          </li>

          {/* SEO */}
          <li>
            <Link
              href="/admin/seo"
              className={`flex items-center px-4 py-1.5 text-sm ${isActive('/admin/seo') ? 'bg-red-700' : 'hover:bg-gray-800'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {expanded && <span className="ml-3 text-sm">SEO</span>}
            </Link>
          </li>

        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="p-3 border-t border-gray-800">
        <Link 
          href="/"
          className="flex items-center text-xs text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {expanded && <span>View Site</span>}
        </Link>
      </div>
    </div>
  );
} 