'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  question_type: string;
  options: string[];
  correct_answer: string | string[];
  points: number;
  order_index: number;
}

interface Quiz {
  id: string;
  section_id: string;
  title: string;
  description: string;
  time_limit: number | null;
  passing_score: number;
  attempts_allowed: number;
  order_index: number;
  questions: Question[];
}

export default function QuizEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const quizId = params.quizId as string;
  const isNewQuiz = quizId === 'new';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(!isNewQuiz);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 0,
    passing_score: 70,
    attempts_allowed: 1,
    order_index: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isNewQuiz) {
        fetchQuizDetails();
      } else {
        // For new quiz, set up default order index
        fetchNextOrderIndex();
      }
    }
  }, [status, session, router, courseId, sectionId, quizId, isNewQuiz]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      
      const data = await response.json();
      setQuiz(data.quiz);
      setFormData({
        title: data.quiz.title,
        description: data.quiz.description || '',
        time_limit: data.quiz.time_limit || 0,
        passing_score: data.quiz.passing_score || 70,
        attempts_allowed: data.quiz.attempts_allowed || 1,
        order_index: data.quiz.order_index
      });
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setError('Failed to load quiz details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextOrderIndex = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes`);
      
      if (response.ok) {
        const data = await response.json();
        const nextIndex = data.quizzes?.length || 0;
        setFormData(prev => ({
          ...prev,
          order_index: nextIndex
        }));
      }
    } catch (err) {
      console.error('Error fetching quizzes for order index:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const method = isNewQuiz ? 'POST' : 'PUT';
      const url = isNewQuiz 
        ? `/api/admin/courses/${courseId}/sections/${sectionId}/quizzes` 
        : `/api/admin/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isNewQuiz ? 'create' : 'update'} quiz`);
      }
      
      const data = await response.json();
      
      if (isNewQuiz) {
        // Redirect to the edit page for the new quiz
        router.push(`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${data.quiz.id}`);
      } else {
        setQuiz(data.quiz);
        // Show success notification
        alert('Quiz updated successfully');
      }
    } catch (err) {
      console.error(`Error ${isNewQuiz ? 'creating' : 'updating'} quiz:`, err);
      setError(`Failed to ${isNewQuiz ? 'create' : 'update'} quiz. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    router.push(`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}/questions/new`);
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/admin/content/courses" className="hover:text-gray-700">
              Courses
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href={`/admin/content/courses/${courseId}`} className="ml-2 hover:text-gray-700">
              Course Details
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href={`/admin/content/courses/${courseId}/sections/${sectionId}`} className="ml-2 hover:text-gray-700">
              Section Editor
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-gray-900 font-medium">
              {isNewQuiz ? 'New Quiz' : 'Quiz Editor'}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
        </h1>
        <p className="text-gray-600">
          {isNewQuiz 
            ? 'Add a new quiz to this section' 
            : 'Update quiz settings and questions'}
        </p>
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

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    name="time_limit"
                    id="time_limit"
                    min="0"
                    value={formData.time_limit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Set to 0 for no time limit
                  </p>
                </div>
                
                <div>
                  <label htmlFor="passing_score" className="block text-sm font-medium text-gray-700">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    name="passing_score"
                    id="passing_score"
                    min="0"
                    max="100"
                    value={formData.passing_score}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="attempts_allowed" className="block text-sm font-medium text-gray-700">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    name="attempts_allowed"
                    id="attempts_allowed"
                    min="1"
                    value={formData.attempts_allowed}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700">
                  Order
                </label>
                <input
                  type="number"
                  name="order_index"
                  id="order_index"
                  min="0"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}`}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (isNewQuiz ? 'Create Quiz' : 'Save Changes')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Questions section (only for existing quizzes) */}
      {!isNewQuiz && (
        <div className="mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Questions</h2>
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
          
          {quiz?.questions && quiz.questions.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {quiz.questions.map((question, index) => (
                  <li key={question.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md text-xs font-medium mr-2">
                            {index + 1}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900">{question.question}</h4>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 
                             question.question_type === 'true_false' ? 'True/False' : 'Fill in Blank'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            {question.points > 1 ? `${question.points} points` : '1 point'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Link
                          href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}/questions/${question.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new question.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 