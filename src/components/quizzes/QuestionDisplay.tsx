'use client';

import { QuizQuestion } from '@/types/quiz';

interface QuestionDisplayProps {
  question: QuizQuestion;
  selectedAnswers: number[];
  onAnswerSelect: (optionId: number) => void;
  questionNumber: number;
}

export default function QuestionDisplay({
  question,
  selectedAnswers,
  onAnswerSelect,
  questionNumber
}: QuestionDisplayProps) {
  const isMultipleSelect = question.question_type === 'multiple_select';

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <div className="text-sm text-gray-500 mb-2">Question {questionNumber}</div>
        <div 
          className="text-2xl font-semibold text-gray-900 mb-4"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options && question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id);
          
          return (
            <label
              key={option.id}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type={isMultipleSelect ? 'checkbox' : 'radio'}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(option.id)}
                  name={isMultipleSelect ? undefined : `question-${question.id}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-gray-900">{option.option_text}</div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {isMultipleSelect && (
        <div className="text-sm text-gray-500 italic">
          Select all correct answers
        </div>
      )}
    </div>
  );
}

