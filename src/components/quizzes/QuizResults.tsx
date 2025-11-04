'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QuizAttempt, QuizResponse } from '@/types/quiz';
import { FaCheckCircle, FaTimesCircle, FaClock, FaTrophy, FaRedo } from 'react-icons/fa';

interface QuizResultsProps {
  attempt: QuizAttempt;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  timeTaken: number;
  responses: QuizResponse[];
  quizSlug: string;
}

export default function QuizResults({
  attempt,
  score,
  totalQuestions,
  correctAnswers,
  passed,
  passingScore,
  timeTaken,
  responses,
  quizSlug
}: QuizResultsProps) {
  const router = useRouter();
  const [showExplanations, setShowExplanations] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          {passed ? (
            <div className="mb-4">
              <FaTrophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600">You passed the quiz</p>
            </div>
          ) : (
            <div className="mb-4">
              <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-600 mb-2">Quiz Complete</h2>
              <p className="text-lg text-gray-600">You need {passingScore}% to pass</p>
            </div>
          )}

          <div className="text-6xl font-bold text-blue-600 mb-4">
            {score.toFixed(1)}%
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Correct Answers</div>
              <div className="text-2xl font-semibold text-gray-900">
                {correctAnswers} / {totalQuestions}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Score</div>
              <div className="text-2xl font-semibold text-gray-900">
                {score.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Time Taken</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatTime(timeTaken)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link
            href={`/quizzes/${quizSlug}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaRedo className="w-4 h-4" />
            Retake Quiz
          </Link>
          <Link
            href="/quizzes"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Browse More Quizzes
          </Link>
        </div>
      </div>

      {/* Question Review */}
      {showExplanations && responses.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Question Review</h3>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </button>
          </div>

          <div className="space-y-6">
            {responses.map((response, index) => {
              const question = response.question;
              if (!question) return null;

              const isCorrect = response.is_correct;
              const selectedOptions = question.options?.filter(opt => 
                response.selected_option_ids.includes(opt.id)
              ) || [];
              const correctOptions = question.options?.filter(opt => opt.is_correct) || [];

              return (
                <div
                  key={response.id}
                  className={`p-6 border-2 rounded-lg ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">
                        Question {index + 1}
                      </span>
                      {isCorrect ? (
                        <FaCheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <FaTimesCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div 
                    className="text-lg font-medium text-gray-900 mb-4"
                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                  />

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Your Answer:</div>
                      {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                          <div
                            key={opt.id}
                            className="p-3 bg-red-100 border border-red-300 rounded mb-2"
                          >
                            {opt.option_text}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-100 border border-gray-300 rounded text-gray-500 italic">
                          No answer selected
                        </div>
                      )}
                    </div>

                    {!isCorrect && correctOptions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</div>
                        {correctOptions.map(opt => (
                          <div
                            key={opt.id}
                            className="p-3 bg-green-100 border border-green-300 rounded mb-2"
                          >
                            {opt.option_text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {question.explanation_text && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-sm font-medium text-blue-900 mb-2">Explanation:</div>
                      <div className="text-sm text-blue-800">{question.explanation_text}</div>
                    </div>
                  )}

                  {question.related_article_url && (
                    <div className="mt-4">
                      <a
                        href={question.related_article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Learn more →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

