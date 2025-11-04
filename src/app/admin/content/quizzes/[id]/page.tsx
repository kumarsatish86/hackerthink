'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import QuizEditor from '@/components/admin/quizzes/QuizEditor';
import toast from 'react-hot-toast';
import { Quiz, QuizCategory } from '@/types/quiz';

export default function EditQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [status, session, router, quizId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/admin/quizzes/${quizId}`),
        fetch('/api/admin/quizzes/categories')
      ]);

      if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');

      const quizData = await quizResponse.json();
      const categoriesData = await categoriesResponse.json();

      setQuiz(quizData.quiz);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      toast.error('Failed to load quiz');
      router.push('/admin/content/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (quizData: Partial<Quiz>) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update quiz');
      }

      toast.success('Quiz updated successfully');
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update quiz');
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

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quiz not found</p>
        <Link href="/admin/content/quizzes" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Quizzes
        </Link>
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
        <Link
          href={`/admin/content/quizzes/${quizId}/questions`}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Manage Questions
        </Link>
      </div>

      <QuizEditor
        quiz={quiz}
        categories={categories}
        onSave={handleSave}
      />
    </div>
  );
}

