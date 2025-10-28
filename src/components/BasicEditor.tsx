'use client';

import React, { useRef, useState } from 'react';

interface BasicEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

const BasicEditor: React.FC<BasicEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = '300px',
  label,
  required = false,
  helperText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertFormatting = (tag: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newCursorPos = end;
    
    switch(tag) {
      case 'b':
        newText = value.substring(0, start) + `<strong>${selectedText}</strong>` + value.substring(end);
        newCursorPos = end + 17; // Length of <strong></strong> tags
        break;
      case 'i':
        newText = value.substring(0, start) + `<em>${selectedText}</em>` + value.substring(end);
        newCursorPos = end + 9; // Length of <em></em> tags
        break;
      case 'u':
        newText = value.substring(0, start) + `<u>${selectedText}</u>` + value.substring(end);
        newCursorPos = end + 7; // Length of <u></u> tags
        break;
      case 'h1':
        newText = value.substring(0, start) + `<h1>${selectedText}</h1>` + value.substring(end);
        newCursorPos = end + 9; // Length of <h1></h1> tags
        break;
      case 'h2':
        newText = value.substring(0, start) + `<h2>${selectedText}</h2>` + value.substring(end);
        newCursorPos = end + 9; // Length of <h2></h2> tags
        break;
      case 'h3':
        newText = value.substring(0, start) + `<h3>${selectedText}</h3>` + value.substring(end);
        newCursorPos = end + 9; // Length of <h3></h3> tags
        break;
      case 'ul':
        if (selectedText) {
          const items = selectedText.split('\n')
            .map(item => item.trim() ? `<li>${item}</li>` : '')
            .filter(Boolean)
            .join('');
          newText = value.substring(0, start) + `<ul>\n${items}\n</ul>` + value.substring(end);
        } else {
          newText = value.substring(0, start) + `<ul>\n<li></li>\n</ul>` + value.substring(end);
        }
        newCursorPos = start + newText.length - value.length + end;
        break;
      case 'ol':
        if (selectedText) {
          const items = selectedText.split('\n')
            .map(item => item.trim() ? `<li>${item}</li>` : '')
            .filter(Boolean)
            .join('');
          newText = value.substring(0, start) + `<ol>\n${items}\n</ol>` + value.substring(end);
        } else {
          newText = value.substring(0, start) + `<ol>\n<li></li>\n</ol>` + value.substring(end);
        }
        newCursorPos = start + newText.length - value.length + end;
        break;
      case 'code':
        newText = value.substring(0, start) + `<code>${selectedText}</code>` + value.substring(end);
        newCursorPos = end + 13; // Length of <code></code> tags
        break;
      case 'link': {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          newText = value.substring(0, start) + `<a href="${url}">${selectedText || url}</a>` + value.substring(end);
          newCursorPos = start + newText.length - value.length + end;
        }
        break;
      }
      case 'image': {
        const url = prompt('Enter image URL:', 'https://');
        if (url) {
          const alt = prompt('Enter alt text (for accessibility):', '');
          newText = value.substring(0, start) + `<img src="${url}" alt="${alt || ''}" />` + value.substring(end);
          newCursorPos = start + newText.length - value.length + end;
        }
        break;
      }
    }
    
    onChange(newText);
    
    // Set focus back to textarea and restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('b')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('i')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('u')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm underline"
            title="Underline"
          >
            U
          </button>
          <span className="mx-1 text-gray-300">|</span>
          <button
            type="button"
            onClick={() => insertFormatting('h1')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm font-bold"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h2')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm font-bold"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('h3')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm font-bold"
            title="Heading 3"
          >
            H3
          </button>
          <span className="mx-1 text-gray-300">|</span>
          <button
            type="button"
            onClick={() => insertFormatting('ul')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('ol')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm"
            title="Numbered List"
          >
            1. List
          </button>
          <span className="mx-1 text-gray-300">|</span>
          <button
            type="button"
            onClick={() => insertFormatting('link')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm"
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('image')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm"
            title="Insert Image"
          >
            🖼️
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('code')}
            className="px-2 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-sm font-mono"
            title="Code"
          >
            &lt;/&gt;
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none"
          style={{ height, minHeight: height }}
          required={required}
        />
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default BasicEditor; 