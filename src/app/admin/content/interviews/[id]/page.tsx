'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import InterviewEditor from '../InterviewEditor';

interface Interview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featured_image?: string | null;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'scheduled';
  schedule_date?: string;
  guest_id: string;
  category_id?: string | null;
  interview_type: 'text' | 'video' | 'podcast' | 'mixed';
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Guest {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  bio?: string;
  title?: string;
  company?: string;
}

export default function InterviewEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.id as string;
  const isNew = interviewId === 'new';

  const [interview, setInterview] = useState<Interview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesRes = await fetch('/api/admin/interviews/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      // Fetch guests
      const guestsRes = await fetch('/api/admin/interviews/guests');
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData.guests || []);
      }

      // Fetch interview if editing
      if (!isNew && interviewId) {
        const interviewRes = await fetch(`/api/admin/interviews/${interviewId}`);
        if (interviewRes.ok) {
          const interviewData = await interviewRes.json();
          setInterview(interviewData.interview);
        } else {
          setError('Interview not found');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (interviewData: Interview) => {
    try {
      const url = isNew
        ? '/api/admin/interviews'
        : `/api/admin/interviews/${interviewId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save interview');
      }

      const data = await response.json();
      
      // Redirect to list page after successful save
      router.push('/admin/content/interviews');
    } catch (err) {
      console.error('Error saving interview:', err);
      throw err;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Link
            href="/admin/content/interviews"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/content/interviews"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Interviews
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <InterviewEditor
          interview={isNew ? undefined : interview || undefined}
          categories={categories}
          guests={guests}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

