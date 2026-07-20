'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';

/**
 * Light/dark toggle scoped to the AI Models module. Must be rendered inside
 * `ModelsThemeProvider` (which uses its own `ht-models-theme` storage key so
 * it doesn't clash with the rest of the site's theme).
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-yellow-300 hover:bg-gray-700'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      } ${className}`}
    >
      {mounted ? (isDark ? <FaSun /> : <FaMoon />) : <FaMoon className="opacity-0" />}
    </button>
  );
}

export default ThemeToggle;
