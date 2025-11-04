'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuizEditor from '@/components/admin/quizzes/QuizEditor';
import toast from 'react-hot-toast';
import { Quiz, QuizCategory } from '@/types/quiz';

export default function NewQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchCategories();
      }
    }
  }, [status, session, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/quizzes/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (quizData: Partial<Quiz>) => {
    try {
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create quiz');
      }

      const data = await response.json();
      toast.success('Quiz created successfully');
      router.push(`/admin/content/quizzes/${data.quiz.id}/questions`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create quiz');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/content/quizzes"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Quizzes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
      </div>

      <QuizEditor
        quiz={undefined}
        categories={categories}
        onSave={handleSave}
      />
    </div>
  );
}

