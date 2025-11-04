'use client';

import { useState, useEffect } from 'react';
import { WithContext, Article } from 'schema-dts';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const [jsonValue, setJsonValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [initialValue, setInitialValue] = useState<string>('');

  // Initialize with default article schema if empty
  useEffect(() => {
    console.log('JsonEditor initialized with value:', value);
    
    if (!value || value.trim() === '') {
      console.log('No value provided, setting empty string');
      // Just set empty value, don't create default schema automatically
      setJsonValue('');
      setInitialValue('');
      setError(null);
    } else {
      try {
        // Try to parse and pretty print the JSON
        console.log('Attempting to parse provided JSON:', value);
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        console.log('Successfully parsed and formatted JSON');
        setJsonValue(formatted);
        setInitialValue(formatted);
        setError(null);
      } catch (err) {
        console.error('Error parsing JSON in JsonEditor:', err);
        // If it's just empty or whitespace, don't show an error
        if (value.trim() === '') {
          setJsonValue('');
          setInitialValue('');
          setError(null);
        } else {
          setJsonValue(value);
          setInitialValue(value);
          setError('Warning: Invalid JSON format');
        }
      }
    }
  }, [value]);

  // For subsequent value changes from parent
  useEffect(() => {
    console.log('JSON value changed from parent:', value);
    console.log('Previous initialValue:', initialValue);
    console.log('Current jsonValue:', jsonValue);
    
    if (value !== initialValue && value !== jsonValue) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        console.log('Parsing new JSON value from parent succeeded');
        setJsonValue(formatted);
        setError(null);
      } catch (err) {
        // Keep the current value even if invalid
        console.error('Error parsing new JSON from parent:', err);
        if (value) {
          setJsonValue(value);
          setError('Warning: Invalid JSON format');
        }
      }
    }
  }, [value, initialValue, jsonValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJsonValue(newValue);
    
    try {
      // Validate JSON format
      JSON.parse(newValue);
      console.log('JSON validation successful, updating parent');
      setError(null);
      onChange(newValue);
    } catch (err) {
      console.error('JSON validation failed:', err);
      setError('Invalid JSON format - Correct before saving');
      // Update raw value anyway so the parent component has the current state
      console.log('Updating parent with invalid JSON');
      onChange(newValue);
    }
  };

  const validateAndFormat = () => {
    try {
      console.log('Formatting JSON');
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonValue(formatted);
      setError(null);
      onChange(formatted);
      console.log('JSON formatting successful');
    } catch (err) {
      console.error('JSON formatting failed:', err);
      setError('Invalid JSON format - Unable to format');
    }
  };

  const createDefaultSchema = () => {
    const defaultSchema: WithContext<Article> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': '',
      'description': '',
      'image': '',
      'author': {
        '@type': 'Person',
        'name': ''
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'HackerThink',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://ainews.com/logo.png'
        }
      },
      'datePublished': new Date().toISOString(),
      'dateModified': new Date().toISOString()
    };
    
    const defaultValue = JSON.stringify(defaultSchema, null, 2);
    setJsonValue(defaultValue);
    setError(null);
    onChange(defaultValue);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <div className="text-sm text-gray-500">JSON-LD Schema</div>
        <div className="flex items-center gap-2">
          {error && (
            <div className="text-sm text-red-500 mr-4">{error}</div>
          )}
          {jsonValue.trim() === '' && (
            <button
              onClick={createDefaultSchema}
              className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
              title="Create default Article schema"
              type="button"
            >
              Create Default
            </button>
          )}
          <button
            onClick={validateAndFormat}
            className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded hover:bg-indigo-100"
            title="Format JSON"
            type="button"
          >
            Format
          </button>
        </div>
      </div>
      <textarea
        value={jsonValue}
        onChange={handleChange}
        className={`w-full h-80 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 font-mono text-sm`}
        placeholder="Enter JSON-LD schema data"
      />
      <div className="mt-2 text-xs text-gray-500">
        <p>Add structured data in JSON-LD format. This helps search engines understand your content better and improves SEO.</p>
        <p className="mt-1">
          <a 
            href="https://schema.org/Article" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Schema.org Article Reference
          </a>
          {' | '}
          <a 
            href="https://search.google.com/test/rich-results" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Test Your Schema
          </a>
        </p>
      </div>
    </div>
  );
};

export default JsonEditor; 