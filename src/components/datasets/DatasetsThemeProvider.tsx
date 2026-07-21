'use client';

import { HtThemeProvider } from '@/components/ht-ui/HtThemeProvider';

export function DatasetsThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <HtThemeProvider storageKey="ht-datasets-theme" defaultTheme="light">
      {children}
    </HtThemeProvider>
  );
}
