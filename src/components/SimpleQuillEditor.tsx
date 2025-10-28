'use client';

import React from 'react';
import TipTapEditor from './TipTapEditor';

interface SimpleQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  height?: string;
}

const SimpleQuillEditor: React.FC<SimpleQuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  readOnly = false,
  height = '400px'
}) => {
  return (
    <div className={`quill-editor-wrapper ${className}`}>
      <TipTapEditor
        content={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
        showToolbar={true}
        showMenuBar={true}
      />
    </div>
  );
};

export default SimpleQuillEditor; 
