'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TipTapEditor from './TipTapEditor';

// Import the Editor component with dynamic loading to prevent SSR issues
const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface Step {
  content: string;
  id: string;
}

interface StepsEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const StepsEditor: React.FC<StepsEditorProps> = ({ value, onChange, placeholder = 'Enter step-by-step instructions...' }) => {
  // Parse initial value into steps
  const parseSteps = (value: string): Step[] => {
    if (!value) return [{ content: '', id: generateId() }];
    
    const parts = value.split('\n\n').filter(part => part.trim() !== '');
    if (parts.length === 0) return [{ content: '', id: generateId() }];
    
    return parts.map(part => ({
      content: part,
      id: generateId()
    }));
  };

  const [steps, setSteps] = useState<Step[]>(() => parseSteps(value));
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Generate a unique ID for each step
  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
  
  // Initialize steps from value prop only once
  useEffect(() => {
    if (!isInitialized) {
      const newSteps = parseSteps(value);
      setSteps(newSteps);
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  
  // Update the parent component when steps change
  const updateParent = (newSteps: Step[]) => {
    const newValue = newSteps.map(step => step.content).join('\n\n');
    onChange(newValue);
  };
  
  // Handle step content change
  const handleStepChange = (index: number, content: string) => {
    const newSteps = [...steps];
    newSteps[index].content = content;
    setSteps(newSteps);
    updateParent(newSteps);
  };
  
  // Add a new step
  const addStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, { content: '', id: generateId() });
    setSteps(newSteps);
    updateParent(newSteps);
  };
  
  // Remove a step
  const removeStep = (index: number) => {
    if (steps.length <= 1) return; // Don't remove the last step
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
    updateParent(newSteps);
  };
  
  // Move a step up or down
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
    updateParent(newSteps);
  };

  return (
    <div className="steps-editor">
      <div className="mb-4 bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions for Steps Editor</h3>
        <p className="text-xs text-blue-600">
          Each box below represents a separate step in your lab exercise. 
          Steps will be displayed as separate blocks with numbered indicators when viewed by students.
        </p>
      </div>
      
      {steps.map((step, index) => (
        <div key={step.id} className="mb-6 border border-gray-300 rounded-md bg-white">
          <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
            <h3 className="font-medium text-gray-700">Step {index + 1}</h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Move Up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Move Down"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length <= 1}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                title="Remove Step"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-1">
            <TipTapEditor
              content={step.content}
              onChange={(content) => handleStepChange(index, content)}
              placeholder={`Write instructions for step ${index + 1}...`}
              height="400px"
            />
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t">
            <button
              type="button"
              onClick={() => addStep(index)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Step After
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepsEditor; 