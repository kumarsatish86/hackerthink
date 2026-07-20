'use client';

import { ThemeProvider } from 'next-themes';

export function ModelsThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="ht-models-theme">
      {children}
    </ThemeProvider>
  );
}
