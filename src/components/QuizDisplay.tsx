'use client';

import React, { useState } from 'react';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

interface Quiz {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

interface QuizDisplayProps {
  data: string;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ data }) => {
  let quiz: Quiz;

  try {
    quiz = JSON.parse(data);
  } catch (e) {
    // If it's not valid JSON, display as plain text
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Knowledge</h2>
        <p className="text-gray-700">{data}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Test Your Knowledge</h2>
      {quiz.description && <p className="text-gray-600 mb-4">{quiz.description}</p>}
      
      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <QuestionDisplay key={qIndex} question={question} questionNumber={qIndex + 1} />
        ))}
      </div>
    </div>
  );
};

interface QuestionDisplayProps {
  question: QuizQuestion;
  questionNumber: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, questionNumber }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const isCorrect = selectedOption !== null && question.options[selectedOption]?.isCorrect;
  const hasSubmitted = selectedOption !== null;

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-medium text-lg mb-2">
          <span className="text-indigo-600 font-bold mr-2">{questionNumber}.</span>
          {question.question}
        </h3>
        
        <div className="space-y-2 mt-4">
          {question.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => !hasSubmitted && handleOptionSelect(index)}
              className={`
                flex items-center p-3 border rounded-md cursor-pointer
                ${selectedOption === index ? 'border-2' : 'border'}
                ${!hasSubmitted ? 'hover:bg-gray-100' : ''}
                ${hasSubmitted && option.isCorrect ? 'bg-green-50 border-green-200' : ''}
                ${hasSubmitted && selectedOption === index && !option.isCorrect ? 'bg-red-50 border-red-200' : ''}
                ${hasSubmitted && selectedOption !== index ? 'opacity-70' : ''}
              `}
            >
              <div className={`
                h-6 w-6 rounded-full flex items-center justify-center mr-3 text-sm font-medium
                ${selectedOption === index ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}
                ${hasSubmitted && option.isCorrect ? 'bg-green-500 text-white' : ''}
                ${hasSubmitted && selectedOption === index && !option.isCorrect ? 'bg-red-500 text-white' : ''}
              `}>
                {String.fromCharCode(65 + index)} {/* A, B, C, D, etc. */}
              </div>
              <div className="flex-1">{option.text}</div>
              {hasSubmitted && option.isCorrect && (
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {hasSubmitted && (
        <div className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center mb-2">
            <div className={`mr-2 text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            {question.explanation && (
              <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className="ml-auto text-indigo-600 hover:text-indigo-800 text-sm underline"
              >
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </button>
            )}
          </div>
          
          {question.explanation && showExplanation && (
            <div className="bg-white p-3 rounded-md border text-gray-700 text-sm">
              {question.explanation}
            </div>
          )}
        </div>
      )}
      
      {!hasSubmitted && (
        <div className="bg-white p-4 border-t">
          <button
            disabled={selectedOption === null}
            onClick={() => selectedOption !== null && setShowExplanation(true)}
            className={`
              px-4 py-2 rounded-md font-medium text-sm
              ${selectedOption === null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizDisplay; 