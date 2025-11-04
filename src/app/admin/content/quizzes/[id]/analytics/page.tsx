'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import QuizAnalytics from '@/components/admin/quizzes/QuizAnalytics';
import toast from 'react-hot-toast';
import { Quiz, QuizAnalytics as QuizAnalyticsType } from '@/types/quiz';
import { FaArrowLeft, FaChartBar } from 'react-icons/fa';

export default function QuizAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [analytics, setAnalytics] = useState<QuizAnalyticsType | null>(null);
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
      const [quizResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/admin/quizzes/${quizId}`),
        fetch(`/api/admin/quizzes/${quizId}/analytics`)
      ]);

      if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');

      const quizData = await quizResponse.json();
      const analyticsData = await analyticsResponse.json();

      setQuiz(quizData.quiz);
      setAnalytics(analyticsData.analytics);
    } catch (error) {
      toast.error('Failed to load data');
      router.push('/admin/content/quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !analytics) {
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
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaChartBar className="w-8 h-8" />
            Quiz Analytics
          </h1>
          <p className="text-gray-600 mt-1">{quiz.title}</p>
        </div>
      </div>

      <QuizAnalytics quiz={quiz} analytics={analytics} />
    </div>
  );
}

