'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TutorialLesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  section_title: string;
  section_slug: string;
  module_title: string;
  module_slug: string;
}

interface TutorialContentProps {
  lessonSlug?: string;
}

const TutorialContent: React.FC<TutorialContentProps> = ({ lessonSlug }) => {
  const params = useParams();
  const [lesson, setLesson] = useState<TutorialLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonSlug || params?.lessonSlug) {
      fetchLesson(lessonSlug || params.lessonSlug as string);
    }
  }, [lessonSlug, params?.lessonSlug]);

  const fetchLesson = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutorials/lessons/view/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setLesson(data.data);
      } else {
        setError('Failed to fetch lesson');
      }
    } catch (err) {
      setError('Error fetching lesson');
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Lesson</h2>
        <p className="text-gray-600 mb-4">{error || 'Lesson not found'}</p>
        <button 
          onClick={() => lessonSlug && fetchLesson(lessonSlug)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/tutorials" className="hover:text-blue-600">
          Tutorials
        </Link>
        <span>›</span>
        <Link 
          href={`/tutorials/${lesson.module_slug}`} 
          className="hover:text-blue-600"
        >
          {lesson.module_title}
        </Link>
        <span>›</span>
        <Link 
          href={`/tutorials/${lesson.module_slug}/${lesson.section_slug}`} 
          className="hover:text-blue-600"
        >
          {lesson.section_title}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
            <p className="text-gray-600 text-lg">{lesson.excerpt}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty_level)}`}>
              <span className="mr-2">{getDifficultyIcon(lesson.difficulty_level)}</span>
              {lesson.difficulty_level.charAt(0).toUpperCase() + lesson.difficulty_level.slice(1)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lesson.estimated_time} min
            </span>
          </div>
        </div>

        {/* Module and Section Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Module:</span>
            <span>{lesson.module_title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Section:</span>
            <span>{lesson.section_title}</span>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Lesson {lesson.order_index} of section
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Next
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Mark as completed</span>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialContent;
