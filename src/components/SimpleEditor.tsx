'use client';

import React from 'react';
import TipTapEditor from './TipTapEditor';

interface SimpleEditorProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  modules?: any;
  readOnly?: boolean;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  modules,
  readOnly = false
}) => {
  return (
    <TipTapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={className}
      id={id}
      advanced={true}
      showToolbar={true}
      showMenuBar={true}
    />
  );
};

export default SimpleEditor;
