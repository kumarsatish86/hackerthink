'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCards from '@/components/admin/AnalyticsCards';
import { FaGraduationCap, FaCheckCircle, FaClock, FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Quiz } from '@/types/quiz';

export default function QuizzesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Bulk actions state
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchQuizzes();
      }
    }
  }, [status, session, router, currentPage, filterStatus, filterDifficulty, searchTerm]);

  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterDifficulty !== 'all' && { difficulty: filterDifficulty })
      });

      const response = await fetch(`/api/admin/quizzes?${params}`);
      const data = await response.json();

      if (!response.ok) {
        // Check if it's a table missing error
        if (data.message && data.message.includes('not created')) {
          setError('QUIZZES_TABLES_NOT_CREATED');
          setMigrationMessage(data.message);
          setQuizzes([]);
          setAnalytics({ total: 0, published: 0, draft: 0, archived: 0 });
          return;
        }
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      setQuizzes(data.quizzes || []);
      
      // Calculate analytics from all quizzes
      const allQuizzes = data.quizzes || [];
      setAnalytics({
        total: allQuizzes.length,
        published: allQuizzes.filter((q: Quiz) => q.status === 'published').length,
        draft: allQuizzes.filter((q: Quiz) => q.status === 'draft').length,
        archived: allQuizzes.filter((q: Quiz) => q.status === 'archived').length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      toast.error('Failed to load quizzes');
      setQuizzes([]);
      setAnalytics({ total: 0, published: 0, draft: 0, archived: 0 });
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    try {
      setMigrationLoading(true);
      setMigrationMessage(null);
      
      const response = await fetch('/api/admin/migrations/create-quizzes-tables', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create tables');
      }

      toast.success('Quizzes tables created successfully!');
      setMigrationMessage(null);
      setError(null);
      // Reload quizzes after migration
      setTimeout(() => {
        fetchQuizzes();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tables';
      toast.error(errorMessage);
      setMigrationMessage(errorMessage);
    } finally {
      setMigrationLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      toast.success('Quiz deleted successfully');
      setDeleteConfirm(null);
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete quiz');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id: number, action: 'publish' | 'unpublish') => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/quizzes/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} quiz`);
      }

      toast.success(`Quiz ${action}ed successfully`);
      fetchQuizzes();
    } catch (err) {
      toast.error(`Failed to ${action} quiz`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedQuizzes.size === 0) return;

    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/admin/quizzes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          quiz_ids: Array.from(selectedQuizzes)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      toast.success(`Successfully ${bulkAction}ed ${selectedQuizzes.size} quiz(es)`);
      setSelectedQuizzes(new Set());
      setSelectAll(false);
      setBulkAction('');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to perform bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (searchTerm && !quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const analyticsCards = [
    {
      title: 'Total Quizzes',
      value: analytics.total,
      icon: <FaGraduationCap className="w-5 h-5" />,
      color: 'red' as const
    },
    {
      title: 'Published',
      value: analytics.published,
      icon: <FaCheckCircle className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      title: 'Draft',
      value: analytics.draft,
      icon: <FaClock className="w-5 h-5" />,
      color: 'yellow' as const
    },
    {
      title: 'Archived',
      value: analytics.archived,
      icon: <FaClock className="w-5 h-5" />,
      color: 'gray' as const
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        <Link
          href="/admin/content/quizzes/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      <AnalyticsCards cards={analyticsCards} loading={loading} />

      {/* Migration Alert */}
      {error === 'QUIZZES_TABLES_NOT_CREATED' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Database Tables Not Created
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The quizzes database tables have not been created yet. Please run the migration to create them.</p>
                {migrationMessage && (
                  <p className="mt-1 text-xs">{migrationMessage}</p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={runMigration}
                  disabled={migrationLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {migrationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Tables...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Quiz Tables</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="flex gap-2">
            {selectedQuizzes.size > 0 && (
              <>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Bulk Actions</option>
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                  <option value="archive">Archive</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkActionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    setSelectAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedQuizzes(new Set(quizzes.map(q => q.id)));
                    } else {
                      setSelectedQuizzes(new Set());
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedQuizzes.has(quiz.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedQuizzes);
                      if (e.target.checked) {
                        newSet.add(quiz.id);
                      } else {
                        newSet.delete(quiz.id);
                      }
                      setSelectedQuizzes(newSet);
                      setSelectAll(newSet.size === quizzes.length);
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                  {quiz.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quiz.question_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    quiz.status === 'published' ? 'bg-green-100 text-green-800' :
                    quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/content/quizzes/${quiz.id}`}
                      className="text-red-600 hover:text-red-900"
                      title="Edit"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                    {quiz.status === 'published' ? (
                      <button
                        onClick={() => handlePublish(quiz.id, 'unpublish')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Unpublish"
                        disabled={actionLoading}
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(quiz.id, 'publish')}
                        className="text-green-600 hover:text-green-900"
                        title="Publish"
                        disabled={actionLoading}
                      >
                        <FaCheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(quiz.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No quizzes found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Quiz</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

