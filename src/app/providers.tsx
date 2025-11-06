'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ClientIntegrations from './components/ClientIntegrations';
import SessionKeepAlive from '@/components/SessionKeepAlive';

export default function Providers({ children }: { children: ReactNode }) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  // Always wrap with provider to ensure hook is available
  // If no site key, use a placeholder - the provider will handle it
  // This ensures the hook can always be called without errors
  const providerKey = recaptchaSiteKey || '0000000000000000000000000000000000000000';

  return (
    <AuthProvider>
      <SessionKeepAlive />
      <ClientIntegrations />
      <GoogleReCaptchaProvider
        reCaptchaKey={providerKey}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: 'head',
          nonce: undefined,
        }}
      >
        {children}
      </GoogleReCaptchaProvider>
      <Toaster position="top-right" />
    </AuthProvider>
  );
} 