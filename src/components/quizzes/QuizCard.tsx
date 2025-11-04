'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Quiz } from '@/types/quiz';
import { FaClock, FaGraduationCap, FaQuestionCircle } from 'react-icons/fa';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800'
  };

  return (
    <Link href={`/quizzes/${quiz.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer">
        {quiz.thumbnail_url && (
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={quiz.thumbnail_url}
              alt={quiz.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
              {quiz.title}
            </h3>
          </div>
          
          {quiz.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {quiz.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {quiz.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[quiz.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                {quiz.difficulty}
              </span>
            )}
            {quiz.question_count !== undefined && (
              <span className="flex items-center gap-1">
                <FaQuestionCircle className="w-4 h-4" />
                {quiz.question_count} questions
              </span>
            )}
            {quiz.estimated_time && (
              <span className="flex items-center gap-1">
                <FaClock className="w-4 h-4" />
                {quiz.estimated_time} min
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Take Quiz →
            </span>
            {quiz.category_names && quiz.category_names.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {quiz.category_names.slice(0, 2).map((category, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

