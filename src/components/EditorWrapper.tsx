'use client';

import React, { useState, useEffect } from 'react';
import TipTapEditor from './TipTapEditor';

interface EditorWrapperProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  modules?: any;
  readOnly?: boolean;
}

// A wrapper component that ensures the editor is only loaded in the browser
const EditorWrapper: React.FC<EditorWrapperProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className = 'h-[300px] mb-12',
  modules,
  readOnly = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [editorKey, setEditorKey] = useState(`editor-${Date.now()}`);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force remount if needed by changing the key
  const resetEditor = () => {
    setEditorKey(`editor-${Date.now()}`);
  };

  if (!isClient) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Editor loading...</p>
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
      <TipTapEditor
        key={editorKey}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        modules={modules}
        readOnly={readOnly}
        aria-labelledby={id}
      />
      {/* Add a hidden reset button for emergency use */}
      <button 
        type="button"
        onClick={resetEditor} 
        className="hidden" 
        aria-hidden="true"
        tabIndex={-1}
        id={`reset-${id}`}
      >
        Reset Editor
      </button>
    </div>
  );
};

export default EditorWrapper; 
