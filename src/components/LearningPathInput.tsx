'use client';

import React, { useState, useEffect } from 'react';

export interface LearningPathStep {
  title: string;
  description: string;
  link?: string;
}

export interface LearningPath {
  previousSteps: LearningPathStep[];
  currentStep: LearningPathStep;
  nextSteps: LearningPathStep[];
}

interface LearningPathInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
}

const LearningPathInput: React.FC<LearningPathInputProps> = ({
  value,
  onChange,
  label = "Recommended Learning Path",
  required = false,
  helperText
}) => {
  // Parse the current value into our structured format, or use default
  const [learningPath, setLearningPath] = useState<LearningPath>(() => {
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If existing value isn't JSON, treat it as the description for current step
        return {
          previousSteps: [],
          currentStep: { title: "Current Step", description: value },
          nextSteps: []
        };
      }
    } else {
      return {
        previousSteps: [],
        currentStep: { title: "Current Step", description: "" },
        nextSteps: []
      };
    }
  });

  // Add a new step to the previous steps
  const addPreviousStep = () => {
    const updatedPath = {
      ...learningPath,
      previousSteps: [...learningPath.previousSteps, { title: "", description: "" }]
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Add a new step to the next steps
  const addNextStep = () => {
    const updatedPath = {
      ...learningPath,
      nextSteps: [...learningPath.nextSteps, { title: "", description: "" }]
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Remove a step from previous steps
  const removePreviousStep = (index: number) => {
    const updatedPath = {
      ...learningPath,
      previousSteps: learningPath.previousSteps.filter((_, i) => i !== index)
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Remove a step from next steps
  const removeNextStep = (index: number) => {
    const updatedPath = {
      ...learningPath,
      nextSteps: learningPath.nextSteps.filter((_, i) => i !== index)
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Update a previous step
  const updatePreviousStep = (index: number, field: keyof LearningPathStep, value: string) => {
    const updatedPath = {
      ...learningPath,
      previousSteps: learningPath.previousSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Update the current step
  const updateCurrentStep = (field: keyof LearningPathStep, value: string) => {
    const updatedPath = {
      ...learningPath,
      currentStep: { ...learningPath.currentStep, [field]: value }
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  // Update a next step
  const updateNextStep = (index: number, field: keyof LearningPathStep, value: string) => {
    const updatedPath = {
      ...learningPath,
      nextSteps: learningPath.nextSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    };
    setLearningPath(updatedPath);
    onChange(JSON.stringify(updatedPath));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-4 mb-4">
        {/* Previous Steps */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Previous Steps</h3>
          
          {learningPath.previousSteps.length === 0 ? (
            <p className="text-sm text-gray-500 italic mb-2">No previous steps defined.</p>
          ) : (
            <div className="space-y-3">
              {learningPath.previousSteps.map((step, index) => (
                <div key={index} className="p-3 bg-white border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updatePreviousStep(index, 'title', e.target.value)}
                        placeholder="Step Title"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePreviousStep(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                  <textarea
                    value={step.description}
                    onChange={(e) => updatePreviousStep(index, 'description', e.target.value)}
                    placeholder="Describe this step"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                  />
                  <input
                    type="text"
                    value={step.link || ''}
                    onChange={(e) => updatePreviousStep(index, 'link', e.target.value)}
                    placeholder="Link to this step (optional)"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          
          <button
            type="button"
            onClick={addPreviousStep}
            className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
          >
            + Add Previous Step
          </button>
        </div>

        {/* Current Step */}
        <div className="border rounded-md p-4 bg-indigo-50">
          <h3 className="font-medium text-indigo-700 mb-2">Current Step</h3>
          
          <div className="p-3 bg-white border rounded-md">
            <input
              type="text"
              value={learningPath.currentStep.title}
              onChange={(e) => updateCurrentStep('title', e.target.value)}
              placeholder="Current Step Title"
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
            />
            <textarea
              value={learningPath.currentStep.description}
              onChange={(e) => updateCurrentStep('description', e.target.value)}
              placeholder="Describe this concept and what the user will learn"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Next Steps */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Next Steps</h3>
          
          {learningPath.nextSteps.length === 0 ? (
            <p className="text-sm text-gray-500 italic mb-2">No next steps defined.</p>
          ) : (
            <div className="space-y-3">
              {learningPath.nextSteps.map((step, index) => (
                <div key={index} className="p-3 bg-white border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateNextStep(index, 'title', e.target.value)}
                        placeholder="Step Title"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNextStep(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateNextStep(index, 'description', e.target.value)}
                    placeholder="Describe this step"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                  />
                  <input
                    type="text"
                    value={step.link || ''}
                    onChange={(e) => updateNextStep(index, 'link', e.target.value)}
                    placeholder="Link to this step (optional)"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          
          <button
            type="button"
            onClick={addNextStep}
            className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
          >
            + Add Next Step
          </button>
        </div>
      </div>

      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default LearningPathInput; 