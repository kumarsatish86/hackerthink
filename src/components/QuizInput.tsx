'use client';

import React, { useState, useEffect } from 'react';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface Quiz {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

interface QuizInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
}

const QuizInput: React.FC<QuizInputProps> = ({
  value,
  onChange,
  label = "Test Your Knowledge",
  required = false,
  helperText
}) => {
  // Parse the current value into our structured format, or use default
  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If existing value isn't JSON, treat it as a single question
        return {
          title: "Knowledge Check",
          questions: [
            {
              question: value,
              options: [
                { text: "Yes", isCorrect: false },
                { text: "No", isCorrect: false }
              ]
            }
          ]
        };
      }
    } else {
      return {
        title: "Knowledge Check",
        questions: [
          {
            question: "",
            options: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false }
            ]
          }
        ]
      };
    }
  });

  // Update the parent form whenever our internal state changes
  useEffect(() => {
    onChange(JSON.stringify(quiz));
  }, [quiz, onChange]);

  // Add a new question
  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ]
        }
      ]
    }));
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Update a question
  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  // Add an option to a question
  const addOption = (questionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q
      )
    }));
  };

  // Remove an option from a question
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) }
          : q
      )
    }));
  };

  // Update an option
  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuizOption, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? { ...opt, [field]: value } : opt
              ) 
            }
          : q
      )
    }));
  };

  // Set an option as correct (and make others incorrect for single-choice questions)
  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                ({ ...opt, isCorrect: j === optionIndex })
              ) 
            }
          : q
      )
    }));
  };

  // Update quiz metadata
  const updateQuizMetadata = (field: keyof Quiz, value: string) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="border rounded-md p-4 bg-white mb-4">
        <div className="mb-4">
          <input
            type="text"
            value={quiz.title}
            onChange={(e) => updateQuizMetadata('title', e.target.value)}
            placeholder="Quiz Title"
            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
          />
          <textarea
            value={quiz.description || ''}
            onChange={(e) => updateQuizMetadata('description', e.target.value)}
            placeholder="Brief quiz description (optional)"
            rows={1}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-700">Question {qIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove Question"
                >
                  &times;
                </button>
              </div>

              <textarea
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="Enter your question..."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3"
              />

              <div className="space-y-2 mb-3">
                <h4 className="text-sm font-medium text-gray-600">Options (select the correct answer)</h4>
                
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${qIndex}-correct`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(qIndex, oIndex)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-500 hover:text-red-700 px-2"
                          title="Remove Option"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {question.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Explanation (Optional)</h4>
                <textarea
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
          >
            + Add Question
          </button>
        </div>
      </div>

      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default QuizInput; 