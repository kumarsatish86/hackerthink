'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QuizResults from '@/components/quizzes/QuizResults';
import { QuizAttempt, QuizResponse } from '@/types/quiz';
import { FaArrowLeft } from 'react-icons/fa';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const attemptId = searchParams.get('attempt');
  
  const [results, setResults] = useState<{
    attempt: QuizAttempt;
    score: number;
    total_questions: number;
    correct_answers: number;
    passed: boolean;
    passing_score: number;
    time_taken: number;
    responses: QuizResponse[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attemptId) {
      fetchResults();
    } else {
      setError('Attempt ID is required');
      setLoading(false);
    }
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/attempts/${attemptId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Results not found');
        } else {
          throw new Error('Failed to fetch results');
        }
        return;
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
          <Link href={`/quizzes/${slug}`} className="text-blue-600 hover:underline">
            ← Back to Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/quizzes/${slug}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Quiz
      </Link>

      <QuizResults
        attempt={results.attempt}
        score={results.score}
        totalQuestions={results.total_questions}
        correctAnswers={results.correct_answers}
        passed={results.passed}
        passingScore={results.passing_score}
        timeTaken={results.time_taken}
        responses={results.responses}
        quizSlug={slug}
      />
    </div>
  );
}

