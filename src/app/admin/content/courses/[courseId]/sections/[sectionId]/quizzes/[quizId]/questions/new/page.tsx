'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewQuestion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');
  
  const [formData, setFormData] = useState({
    question: '',
    question_type: 'multiple_choice',
    options: ['', ''],
    correct_answer: '',
    points: 1,
    order_index: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        // Fetch quiz details to get the title
        fetchQuizDetails();
      }
    }
  }, [status, session, router, quizId]);

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      
      const data = await response.json();
      setQuizTitle(data.quiz.title);
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setError('Failed to load quiz details. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      setError('Multiple choice questions require at least 2 options');
      return;
    }
    
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    
    // Update correct answer if it was the removed option
    let newCorrectAnswer = formData.correct_answer;
    if (formData.correct_answer === index.toString()) {
      newCorrectAnswer = '';
    } else if (parseInt(formData.correct_answer) > index) {
      // Adjust correct answer index if it was after the removed option
      newCorrectAnswer = (parseInt(formData.correct_answer) - 1).toString();
    }
    
    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correct_answer: newCorrectAnswer
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question) {
      setError('Question text is required');
      return;
    }

    if (formData.question_type === 'multiple_choice' && formData.options.length < 2) {
      setError('Multiple choice questions require at least 2 options');
      return;
    }

    if (!formData.correct_answer) {
      setError('Please select the correct answer');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Transform the data for the API
      const dataToSend = {
        ...formData,
        // For multiple choice, correct_answer is the index of the option
        correct_answer: formData.question_type === 'multiple_choice' 
          ? formData.options[parseInt(formData.correct_answer)]
          : formData.correct_answer
      };
      
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
      }
      
      // Redirect back to quiz page after successful creation
      router.push(`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`);
    } catch (err: any) {
      console.error('Error creating question:', err);
      setError(err.message || 'Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <Link href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`} className="ml-2 hover:text-gray-700">
              Quiz Editor
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-gray-900 font-medium">New Question</span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Question</h1>
        <p className="text-gray-600">Add a question to: {quizTitle || 'Quiz'}</p>
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
                <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="question"
                  name="question"
                  rows={3}
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your question here"
                ></textarea>
              </div>

              <div>
                <label htmlFor="question_type" className="block text-sm font-medium text-gray-700">
                  Question Type
                </label>
                <select
                  id="question_type"
                  name="question_type"
                  value={formData.question_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="fill_in_blank">Fill in the Blank</option>
                </select>
              </div>

              {formData.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`correct_${index}`}
                          name="correct_answer"
                          value={index}
                          checked={formData.correct_answer === index.toString()}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="ml-2 flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              )}

              {formData.question_type === 'true_false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="true"
                        name="correct_answer"
                        value="true"
                        checked={formData.correct_answer === 'true'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="true" className="ml-2 block text-sm text-gray-900">
                        True
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="false"
                        name="correct_answer"
                        value="false"
                        checked={formData.correct_answer === 'false'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="false" className="ml-2 block text-sm text-gray-900">
                        False
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {formData.question_type === 'fill_in_blank' && (
                <div>
                  <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="correct_answer"
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}

              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  id="points"
                  min="1"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Points awarded for a correct answer
                </p>
              </div>

              <div className="flex justify-end">
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 