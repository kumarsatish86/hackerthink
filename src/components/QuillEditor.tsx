'use client';

import React from 'react';
import TipTapEditor from './TipTapEditor';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  'aria-labelledby'?: string;
  id?: string;
  required?: boolean;
  advanced?: boolean;
}

// Default formats (kept for compatibility)
export const DEFAULT_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image', 'video',
  'blockquote', 'code-block'
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  readOnly = false,
  'aria-labelledby': ariaLabelledby,
  id,
  required,
  advanced = true
}) => {
  return (
    <TipTapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={className}
      id={id}
      advanced={advanced}
      showToolbar={true}
      showMenuBar={true}
    />
  );
};

export default QuillEditor;
