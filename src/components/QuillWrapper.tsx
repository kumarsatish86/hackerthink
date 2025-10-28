'use client';

import React from 'react';
import TipTapEditor from './TipTapEditor';

// Simple wrapper that renders client-side only to avoid SSR issues
export default function QuillWrapper(props: any) {
  return (
    <TipTapEditor
      value={props.value || ''}
      onChange={props.onChange}
      placeholder={props.placeholder || ''}
      readOnly={props.readOnly || false}
      className={props.className || ''}
      style={props.style}
      advanced={true}
      showToolbar={true}
      showMenuBar={true}
    />
  );
}
