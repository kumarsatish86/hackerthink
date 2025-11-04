'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InterviewCard from '@/components/interviews/InterviewCard';
import { FaMicrophone } from 'react-icons/fa';

interface Interview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  featured_image_alt?: string;
  interview_type: string;
  featured: boolean;
  view_count: number;
  publish_date: string;
  guest_name: string;
  guest_slug?: string;
  guest_photo?: string;
  guest_title?: string;
  guest_company?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategoryInterviews();
    }
  }, [slug]);

  const fetchCategoryInterviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interviews/category/${slug}?page=${page}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch category interviews');
      }
      
      const data = await response.json();
      setCategory(data.category);
      setInterviews(data.interviews || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error('Error fetching category interviews:', err);
      setError('Failed to load interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchCategoryInterviews(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
            <p className="text-sm text-red-700">{error || 'Category not found'}</p>
          </div>
          <Link
            href="/interviews"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/interviews"
            className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
          >
            ← Back to Interviews
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-600 mb-6">
              {category.description}
            </p>
          )}
          
          <p className="text-gray-600">
            {pagination.total} interview{pagination.total !== 1 ? 's' : ''} in this category
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {interviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaMicrophone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interviews found
            </h3>
            <p className="text-gray-500">
              No interviews in this category yet. Check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Interview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

