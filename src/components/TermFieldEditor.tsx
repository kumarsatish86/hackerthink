'use client';

import { useState, useEffect } from 'react';
import TipTapEditor from './TipTapEditor';

// Make sure this CSS import is available


interface TermFieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  height?: string;
}

const TermFieldEditor: React.FC<TermFieldEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  helperText,
  required = false,
  height = '200px'
}) => {
  const [fieldValue, setFieldValue] = useState(value);

  // Initialize with props values
  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  // Handle changes
  const handleChange = (content: string) => {
    setFieldValue(content);
    onChange(content);
  };

  // Quill modules configuration - matches the article editor from the screenshot
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Normal, H1, H2, H3
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }], // Text and background color
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript and superscript
      [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
      [{ 'align': [] }], // Text alignment
      ['link', 'image', 'code-block'],
      ['blockquote', 'code'],
      ['clean'] // Remove formatting
    ],
  };

  return (
    <div className="mb-6">
      <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border border-gray-300 rounded-md">
        <TipTapEditor
          theme="snow"
          value={fieldValue}
          onChange={handleChange}
          modules={quillModules}
          placeholder={placeholder}
          style={{ minHeight: height }}
        />
      </div>
      {helperText && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default TermFieldEditor; 
