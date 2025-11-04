'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FixPermissions() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('admin');

  const roles = ['admin', 'editor', 'author', 'instructor', 'user'];

  useEffect(() => {
    // Fetch debug info on component mount
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug-session');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const handleUpdateRole = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/admin/auth/fix-admin?role=${selectedRole}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Role updated to ${selectedRole}. Please sign out and sign in again for changes to take effect.`);
        // Refresh debug info
        await fetchDebugInfo();
        // Update the session
        await update();
      } else {
        setMessage(`Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Fix Permissions</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Session</h2>
        
        {status === 'loading' ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : status === 'unauthenticated' ? (
          <div className="mb-4 text-red-600">
            <p>You are not signed in. Please <Link href="/auth/signin" className="text-red-600 underline">sign in</Link> to continue.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {session?.user?.name || 'Not available'}</p>
            <p><span className="font-medium">Email:</span> {session?.user?.email || 'Not available'}</p>
            <p><span className="font-medium">Role:</span> {session?.user?.role || 'Not available'}</p>
          </div>
        )}
      </div>

      {status === 'authenticated' && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Update Your Role</h2>
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleUpdateRole}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded-md ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto max-h-96">
            <h3 className="text-lg font-medium mb-2">Database User:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(debugInfo.dbUser, null, 2)}</pre>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Session Data:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(debugInfo.sessionData, null, 2)}</pre>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Allowed Roles:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(debugInfo.allowedRoles, null, 2)}</pre>
            
            <p className="mt-4 text-sm text-gray-500">Last updated: {new Date(debugInfo.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
} 
