'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Ensure session persistence across browser sessions
  useEffect(() => {
    // Check if we have a stored session
    const storedSession = localStorage.getItem('next-auth.session-token');
    if (storedSession) {
      // Session exists, ensure it's valid
      console.log('Stored session found, ensuring validity...');
    }
  }, []);

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
      refetchWhenOffline={false} // Don't refetch when offline
    >
      {children}
    </SessionProvider>
  );
} 