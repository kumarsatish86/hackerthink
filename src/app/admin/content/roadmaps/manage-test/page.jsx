'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageTestRoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const createTestRoadmap = async () => {
    try {
      setLoading(true);
      setMessage('Creating test roadmap...');
      
      const response = await fetch('/api/migrations/add-test-roadmap');
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Success: ${data.message}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixRoadmapsTables = async () => {
    try {
      setLoading(true);
      setMessage('Fixing roadmaps tables...');
      
      const response = await fetch('/api/migrations/fix-roadmaps-table');
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Success: ${data.message}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Test Roadmap</h1>
          <p className="text-gray-600">Create and manage test roadmap</p>
        </div>
        <Link
          href="/admin/content/roadmaps"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
        >
          Back to Roadmaps
        </Link>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Test Roadmap</h2>
          <p className="text-gray-600 mb-4">
            This will create a test roadmap with the slug 'test-roadmap' and some sample modules.
          </p>
          <button
            onClick={createTestRoadmap}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Create Test Roadmap'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fix Roadmaps Tables</h2>
          <p className="text-gray-600 mb-4">
            This will check and fix the roadmaps table structure.
          </p>
          <button
            onClick={fixRoadmapsTables}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Fix Tables'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Test Roadmap Links</h2>
        <div className="space-y-2">
          <div>
            <a 
              href="/learning-roadmap/test-roadmap" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              View Test Roadmap
            </a>
          </div>
          <div>
            <a 
              href="/admin/content/roadmaps" 
              className="text-blue-600 hover:underline"
            >
              Manage All Roadmaps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 