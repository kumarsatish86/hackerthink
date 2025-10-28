'use client';

import React from 'react';
import TipTapEditor from './TipTapEditor';

interface DirectQuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  id?: string;
  advanced?: boolean;
}

const DirectQuillEditor: React.FC<DirectQuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  readOnly = false,
  id,
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

export default DirectQuillEditor;
