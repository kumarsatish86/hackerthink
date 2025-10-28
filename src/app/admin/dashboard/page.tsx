'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data
const mockStats = [
  { id: 1, name: 'Total Users', stat: '1,482', icon: 'users', change: '+12%', changeType: 'increase' },
  { id: 2, name: 'Course Enrollments', stat: '3,674', icon: 'course', change: '+24%', changeType: 'increase' },
  { id: 3, name: 'Completion Rate', stat: '68%', icon: 'chart', change: '+5%', changeType: 'increase' },
  { id: 4, name: 'Active Users', stat: '943', icon: 'activity', change: '+18%', changeType: 'increase' },
];

const mockRecentContent = [
  { id: 1, title: 'Docker for DevOps Engineers', type: 'Course', status: 'Published', date: '2 days ago', author: 'Admin User' },
  { id: 3, title: 'Networking Fundamentals', type: 'Quiz', status: 'Published', date: '1 week ago', author: 'Admin User' },
  { id: 4, title: 'Cloud Security Best Practices', type: 'Article', status: 'Under Review', date: '2 weeks ago', author: 'Admin User' },
];

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joinedDate: '2 months ago', lastActive: '1 day ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', joinedDate: '1 month ago', lastActive: '3 hours ago' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'author', joinedDate: '6 months ago', lastActive: '2 days ago' },
  { id: 4, name: 'Lisa Brown', email: 'lisa@example.com', role: 'user', joinedDate: '2 weeks ago', lastActive: 'Just now' },
];

export default function AdminDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<{
    running: boolean;
    message: string;
    success?: boolean;
  }>({ running: false, message: '' });
  const [isInitializingDb, setIsInitializingDb] = useState(false);
  const [dbInitMessage, setDbInitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // Check if user has admin role
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      }
      setLoading(false);
    }
  }, [status, session, router]);

  // Session refresh mechanism to keep session alive
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Refresh session every 10 minutes to keep it alive
      const interval = setInterval(() => {
        update(); // This will refresh the session
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(interval);
    }
  }, [status, session, update]);

  // Session health check
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Check session health every 5 minutes
      const healthCheck = setInterval(() => {
        const now = new Date();
        const sessionAge = now.getTime() - new Date(session.user?.id || '').getTime();
        const maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (sessionAge > maxAge * 0.8) { // Warn when 80% of session time has passed
          console.log('Session health check: Session aging, consider refresh');
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(healthCheck);
    }
  }, [status, session]);

  const runMigrations = async () => {
    try {
      setMigrationStatus({ running: true, message: 'Running migrations...' });
      
      const response = await fetch('/api/admin/migrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMigrationStatus({ 
          running: false, 
          message: data.message, 
          success: true 
        });
      } else {
        setMigrationStatus({ 
          running: false, 
          message: `Migration failed: ${data.message || 'Unknown error'}`, 
          success: false 
        });
      }
    } catch (error) {
      setMigrationStatus({ 
        running: false, 
        message: `Error running migrations: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        success: false 
      });
    }
  };

  const handleInitializeDatabase = async () => {
    if (isInitializingDb) return;
    
    try {
      setIsInitializingDb(true);
      setDbInitMessage('Initializing database...');
      
      const response = await fetch('/api/admin/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDbInitMessage('Database initialized successfully! You can now manage content.');
      } else {
        throw new Error(data.message || 'Failed to initialize database');
      }
    } catch (error: any) {
      console.error('Error initializing database:', error);
      setDbInitMessage(`Error initializing database: ${error.message || 'Unknown error'}`);
    } finally {
      setIsInitializingDb(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your content, users, and site settings</p>
      </div>

      {/* Migration Status */}
      {migrationStatus.message && (
        <div className={`mb-6 p-4 rounded-md ${
          migrationStatus.success ? 'bg-green-50 text-green-800 border border-green-200' : 
          migrationStatus.success === false ? 'bg-red-50 text-red-800 border border-red-200' : 
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {migrationStatus.success ? (
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : migrationStatus.success === false ? (
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{migrationStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Initialization Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Database Management</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Initialize your database and set up required tables</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleInitializeDatabase}
              disabled={isInitializingDb}
              className={`px-4 py-2 rounded-md ${
                isInitializingDb
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isInitializingDb ? 'Initializing...' : 'Initialize Database'}
            </button>
            
            {dbInitMessage && (
              <div className={`p-3 rounded-md ${
                dbInitMessage.includes('Error') 
                  ? 'bg-red-100 text-red-800' 
                  : dbInitMessage.includes('successfully') 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {dbInitMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
                  {item.icon === 'users' && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {item.icon === 'course' && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {item.icon === 'chart' && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {item.icon === 'activity' && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{item.stat}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.changeType === 'increase' ? (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                          {item.change}
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Administration</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Database Maintenance</h3>
          <div className="flex flex-col space-y-4">
            <div>
              <button
                onClick={runMigrations}
                disabled={migrationStatus.running}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {migrationStatus.running ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Migrations...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Run Migrations
                  </>
                )}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Updates the database schema to include all needed fields. Use this if you encounter errors with missing fields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View and edit user accounts</p>
            </div>
          </Link>
          <Link
            href="/admin/content/articles"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Articles</h3>
              <p className="text-sm text-gray-500">Create and edit articles</p>
            </div>
          </Link>
          <Link
            href="/admin/content/courses"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Courses</h3>
              <p className="text-sm text-gray-500">Create and manage educational courses</p>
            </div>
          </Link>
          <Link
            href="/admin/content/glossary"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Glossary</h3>
              <p className="text-sm text-gray-500">Create and edit technical terms</p>
            </div>
          </Link>
          <Link
            href="/admin/content/roadmaps"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Learning Roadmaps</h3>
              <p className="text-sm text-gray-500">Create and manage learning paths</p>
            </div>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-5 flex items-center"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Site Settings</h3>
              <p className="text-sm text-gray-500">Configure site options</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Users */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {mockUsers.map((user) => (
                <li key={user.id}>
                  <Link href={`/admin/users/${user.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Joined {user.joinedDate}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>Last active {user.lastActive}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-3 text-center">
              <Link href="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 