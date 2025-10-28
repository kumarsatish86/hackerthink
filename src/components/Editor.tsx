'use client';

import React, { forwardRef } from 'react';
import TipTapEditor from './TipTapEditor';

// Define types for compatibility
interface QuillModules {
  toolbar: {
    container: any[];
    handlers?: Record<string, Function>;
  };
  clipboard: {
    matchVisual: boolean;
  };
}

// Create a wrapper component to fix React 18 compatibility
const QuillWrapper = forwardRef(({ value, onChange, modules, theme, placeholder, className }: any, ref: any) => {
  return (
    <TipTapEditor
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || ''}
      readOnly={false}
      className={className || ''}
      advanced={true}
      showToolbar={true}
      showMenuBar={true}
    />
  );
});

QuillWrapper.displayName = 'QuillWrapper';

export default QuillWrapper;
