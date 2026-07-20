'use client';

import { HtThemeProvider } from '@/components/ht-ui/HtThemeProvider';

/** Models-scoped theme (isolated storage key). Re-exports HtThemeProvider. */
export function ModelsThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <HtThemeProvider storageKey="ht-models-theme" defaultTheme="light">
      {children}
    </HtThemeProvider>
  );
}
