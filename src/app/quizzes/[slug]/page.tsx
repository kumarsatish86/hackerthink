'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Quiz } from '@/types/quiz';
import { FaClock, FaQuestionCircle, FaGraduationCap, FaArrowLeft } from 'react-icons/fa';

export default function QuizIntroPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [slug]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Quiz not found');
        } else {
          throw new Error('Failed to fetch quiz');
        }
        return;
      }

      const data = await response.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    router.push(`/quizzes/${slug}/take`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
          <Link href="/quizzes" className="text-blue-600 hover:underline">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {quiz.thumbnail_url && (
          <div className="relative w-full h-64 bg-gray-200">
            <Image
              src={quiz.thumbnail_url}
              alt={quiz.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-lg text-gray-600 mb-6">{quiz.description}</p>
              )}
            </div>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            {quiz.difficulty && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaGraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[quiz.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                    {quiz.difficulty}
                  </span>
                </div>
              </div>
            )}

            {quiz.question_count !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaQuestionCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-lg font-semibold text-gray-900">{quiz.question_count}</p>
                </div>
              </div>
            )}

            {quiz.estimated_time && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="text-lg font-semibold text-gray-900">{quiz.estimated_time} minutes</p>
                </div>
              </div>
            )}
          </div>

          {/* Quiz Info */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Passing Score:</span>
              <span>{quiz.passing_score}%</span>
            </div>
            {quiz.randomize_questions && (
              <div className="text-sm text-gray-600">
                Questions will be randomized
              </div>
            )}
            {quiz.randomize_answers && (
              <div className="text-sm text-gray-600">
                Answer options will be randomized
              </div>
            )}
          </div>

          {/* Categories */}
          {quiz.category_names && quiz.category_names.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Categories:</p>
              <div className="flex flex-wrap gap-2">
                {quiz.category_names.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-center pt-6 border-t">
            <button
              onClick={handleStartQuiz}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

