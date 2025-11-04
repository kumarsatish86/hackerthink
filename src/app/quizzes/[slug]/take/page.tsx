'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizTaker from '@/components/quizzes/QuizTaker';
import { QuizQuestion } from '@/types/quiz';

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [quizData, setQuizData] = useState<{
    attempt: any;
    questions: QuizQuestion[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startQuiz();
  }, [slug]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${slug}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Quiz not found');
        } else {
          throw new Error('Failed to start quiz');
        }
        return;
      }

      const data = await response.json();
      setQuizData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (attemptId: number) => {
    router.push(`/quizzes/${slug}/results?attempt=${attemptId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Starting quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to start quiz'}</p>
          <button
            onClick={() => router.push(`/quizzes/${slug}`)}
            className="text-blue-600 hover:underline"
          >
            ← Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizTaker
      attempt={quizData.attempt}
      questions={quizData.questions}
      onComplete={handleComplete}
    />
  );
}

