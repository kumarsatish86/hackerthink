'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import QuestionList from '@/components/admin/quizzes/QuestionList';
import QuestionEditor from '@/components/admin/quizzes/QuestionEditor';
import toast from 'react-hot-toast';
import { Quiz, QuizQuestion } from '@/types/quiz';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

export default function QuestionsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showEditor, setShowEditor] = useState(false);

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
      const [quizResponse, questionsResponse] = await Promise.all([
        fetch(`/api/admin/quizzes/${quizId}`),
        fetch(`/api/admin/quizzes/${quizId}/questions`)
      ]);

      if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions');

      const quizData = await quizResponse.json();
      const questionsData = await questionsResponse.json();

      setQuiz(quizData.quiz);
      setQuestions(questionsData.questions || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (questionData: Partial<QuizQuestion>) => {
    try {
      const url = editingQuestion
        ? `/api/admin/quizzes/${quizId}/questions/${editingQuestion.id}`
        : `/api/admin/quizzes/${quizId}/questions`;
      
      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save question');
      }

      toast.success(`Question ${editingQuestion ? 'updated' : 'created'} successfully`);
      setShowEditor(false);
      setEditingQuestion(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete question');

      toast.success('Question deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setShowEditor(true);
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setShowEditor(true);
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
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-gray-600 mt-1">{quiz.title}</p>
        </div>
        <Link
          href={`/admin/content/quizzes/${quizId}`}
          className="text-gray-600 hover:text-gray-900"
        >
          Edit Quiz
        </Link>
        <button
          onClick={handleNewQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          New Question
        </button>
      </div>

      {showEditor ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingQuestion ? 'Edit Question' : 'New Question'}
            </h2>
            <button
              onClick={() => {
                setShowEditor(false);
                setEditingQuestion(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
          <QuestionEditor
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setShowEditor(false);
              setEditingQuestion(null);
            }}
          />
        </div>
      ) : (
        <QuestionList
          questions={questions}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          onReorder={async (reorderedQuestions) => {
            // Update order in database
            try {
              for (let i = 0; i < reorderedQuestions.length; i++) {
                const question = reorderedQuestions[i];
                await fetch(`/api/admin/quizzes/${quizId}/questions/${question.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ order_in_quiz: i })
                });
              }
              setQuestions(reorderedQuestions);
              toast.success('Questions reordered');
            } catch (error) {
              toast.error('Failed to reorder questions');
            }
          }}
        />
      )}
    </div>
  );
}

