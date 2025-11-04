'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import SessionKeepAlive from '@/components/SessionKeepAlive';

// Mark all admin routes as dynamic
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session) {
      if (session.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
    // Don't set loading to false for 'loading' status to prevent flashing
  }, [status, session, router]);

  // Session refresh mechanism to keep session alive
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Refresh session every 15 minutes to keep it alive
      const interval = setInterval(() => {
        update(); // This will refresh the session
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(interval);
    }
  }, [status, session, update]);

  // Session timeout warning
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Show warning 2 minutes before session expires
      const warningTimeout = setTimeout(() => {
        if (confirm('Your session will expire soon. Would you like to extend it?')) {
          update();
        }
      }, 28 * 60 * 1000); // 28 minutes (2 minutes before 30-minute expiry)

      return () => clearTimeout(warningTimeout);
    }
  }, [status, session, update]);

  // Show loading spinner only when we're actually loading and not authenticated
  if (status === 'loading' || (loading && status !== 'authenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Don't render admin UI if not authenticated or not admin
  if (status === 'unauthenticated' || !session || session.user?.role !== 'admin') {
    return null;
  }

  // Isolate admin UI from main site UI, but don't affect global styles
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-hidden w-full h-screen">
      {/* Session Keep Alive Component */}
      <SessionKeepAlive />
      
      {/* Admin UI */}
      <div className="flex h-screen w-full">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 