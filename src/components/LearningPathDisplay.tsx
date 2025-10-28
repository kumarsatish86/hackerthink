'use client';

import React from 'react';
import Link from 'next/link';

interface LearningPathStep {
  title: string;
  description: string;
  link?: string;
}

interface LearningPath {
  previousSteps: LearningPathStep[];
  currentStep: LearningPathStep;
  nextSteps: LearningPathStep[];
}

interface LearningPathDisplayProps {
  data: string;
}

const LearningPathDisplay: React.FC<LearningPathDisplayProps> = ({ data }) => {
  let learningPath: LearningPath;

  try {
    learningPath = JSON.parse(data);
  } catch (e) {
    // If it's not valid JSON, display as plain text
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recommended Learning Path</h2>
        <p className="text-gray-700">{data}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Recommended Learning Path</h2>
      
      <div className="relative flex">
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-indigo-200 z-0"></div>
        
        <div className="w-full space-y-6 relative z-10">
          {/* Previous Steps */}
          {learningPath.previousSteps && learningPath.previousSteps.length > 0 && (
            <div className="space-y-4">
              {learningPath.previousSteps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 relative">
                    <div className="rounded-full h-12 w-12 bg-gray-100 border-2 border-indigo-200 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-4 bg-gray-100 rounded-lg p-4 w-full shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-700">{step.title || 'Previous Step'}</h3>
                      {step.link && (
                        <Link href={step.link} className="text-sm text-indigo-600 hover:text-indigo-800">
                          View &rarr;
                        </Link>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Step */}
          <div className="flex">
            <div className="flex-shrink-0 relative">
              <div className="rounded-full h-12 w-12 bg-indigo-500 border-2 border-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">
                  {learningPath.previousSteps?.length ? learningPath.previousSteps.length + 1 : 1}
                </span>
              </div>
            </div>
            <div className="ml-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4 w-full shadow-sm">
              <h3 className="font-medium text-indigo-800">{learningPath.currentStep?.title || 'Current Step'}</h3>
              <p className="text-indigo-700 mt-1 text-sm">{learningPath.currentStep?.description || 'You are here'}</p>
            </div>
          </div>

          {/* Next Steps */}
          {learningPath.nextSteps && learningPath.nextSteps.length > 0 && (
            <div className="space-y-4">
              {learningPath.nextSteps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 relative">
                    <div className="rounded-full h-12 w-12 bg-gray-100 border-2 border-indigo-200 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">
                        {(learningPath.previousSteps?.length || 0) + 2 + index}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 bg-gray-100 rounded-lg p-4 w-full shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-700">{step.title || 'Next Step'}</h3>
                      {step.link && (
                        <Link href={step.link} className="text-sm text-indigo-600 hover:text-indigo-800">
                          View &rarr;
                        </Link>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathDisplay; 