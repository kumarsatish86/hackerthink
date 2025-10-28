'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import ClientIntegrations from './components/ClientIntegrations';
import SessionKeepAlive from '@/components/SessionKeepAlive';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SessionKeepAlive />
      <ClientIntegrations />
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
} 