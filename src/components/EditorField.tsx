'use client';

import React from 'react';
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

// Default modules configuration (kept for compatibility)
const defaultModules: QuillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  },
  clipboard: {
    matchVisual: false
  }
};

interface EditorFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  modules?: QuillModules;
  label?: string;
  required?: boolean;
  helperText?: string;
}

const EditorField: React.FC<EditorFieldProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = '300px',
  modules = defaultModules,
  label,
  required = false,
  helperText
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <TipTapEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
        advanced={true}
        showToolbar={true}
        showMenuBar={true}
      />
      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default EditorField;
