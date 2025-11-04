'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/types/quiz';
import { FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';

interface QuestionListProps {
  questions: QuizQuestion[];
  onEdit: (question: QuizQuestion) => void;
  onDelete: (questionId: number) => void;
  onReorder: (questions: QuizQuestion[]) => void;
}

export default function QuestionList({ questions, onEdit, onDelete, onReorder }: QuestionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      const newQuestions = [...questions];
      const draggedQuestion = newQuestions[draggedIndex];
      newQuestions.splice(draggedIndex, 1);
      newQuestions.splice(index, 0, draggedQuestion);
      onReorder(newQuestions);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <p className="text-gray-500 mb-4">No questions yet</p>
        <p className="text-sm text-gray-400">Click "New Question" to add your first question</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-6 hover:bg-gray-50 transition-colors ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 cursor-move text-gray-400 hover:text-gray-600">
                <FaGripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {question.order_in_quiz + 1}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        question.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                        question.question_type === 'multiple_select' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {question.question_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div 
                      className="text-gray-900 mb-3"
                      dangerouslySetInnerHTML={{ __html: question.question_text.substring(0, 200) + (question.question_text.length > 200 ? '...' : '') }}
                    />
                    {question.options && question.options.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{question.options.length}</span> options
                        {' • '}
                        <span className="font-medium">
                          {question.options.filter((opt: any) => opt.is_correct).length}
                        </span> correct answer(s)
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEdit(question)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(question.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

