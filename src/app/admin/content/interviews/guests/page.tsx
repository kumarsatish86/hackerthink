'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Guest {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  bio?: string;
  title?: string;
  company?: string;
  company_url?: string;
  designation?: string;
  social_links?: any;
  verified: boolean;
  interview_count: number;
  created_at: string;
  updated_at: string;
}

export default function GuestsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchGuests();
      }
    }
  }, [status, session, router]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/interviews/guests');
      
      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }
      
      const data = await response.json();
      setGuests(data.guests || []);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to load guests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest? This will also delete all associated interviews.')) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/interviews/guests/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }
      
      await fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      setError('Failed to delete guest');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link
              href="/admin/content/interviews"
              className="text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
            >
              ← Back to Interviews
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          </div>
          <Link
            href="/admin/content/interviews/guests/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaPlus /> New Guest
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Guests List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title / Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {guest.photo_url ? (
                        <img
                          src={guest.photo_url}
                          alt={guest.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <FaUser className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">{guest.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{guest.title || '-'}</div>
                    <div className="text-sm text-gray-500">{guest.company || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.interview_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.verified ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Not Verified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/content/interviews/guests/${guest.id}`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        disabled={actionLoading || (guest.interview_count > 0)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center gap-1"
                        title={guest.interview_count > 0 ? 'Cannot delete guest with interviews' : 'Delete guest'}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No guests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

