'use client';

import { ThemeProvider } from 'next-themes';

export type HtThemeProviderProps = {
  children: React.ReactNode;
  /** Isolated storage key so scopes don't fight global site theme. Default: ht-theme */
  storageKey?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
};

/**
 * Platform theme provider. Models module uses ModelsThemeProvider which re-exports this
 * with storageKey="ht-models-theme" for backward compatibility.
 */
export function HtThemeProvider({
  children,
  storageKey = 'ht-theme',
  defaultTheme = 'light',
}: HtThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem storageKey={storageKey}>
      {children}
    </ThemeProvider>
  );
}
