'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion, QuizQuestionOption } from '@/types/quiz';
import TipTapEditor from '@/components/TipTapEditor';
import toast from 'react-hot-toast';

interface QuestionEditorProps {
  question?: QuizQuestion | null;
  onSave: (questionData: Partial<QuizQuestion>) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'multiple_choice' as 'multiple_choice' | 'multiple_select' | 'true_false',
    explanation_text: question?.explanation_text || '',
    related_article_url: question?.related_article_url || '',
    options: question?.options || [] as QuizQuestionOption[]
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        explanation_text: question.explanation_text || '',
        related_article_url: question.related_article_url || '',
        options: question.options || []
      });
    } else {
      // Initialize with default options for new question
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        explanation_text: '',
        related_article_url: '',
        options: [
          { id: 0, option_text: '', is_correct: false, order_in_question: 0, question_id: 0 },
          { id: 0, option_text: '', is_correct: false, order_in_question: 1, question_id: 0 }
        ]
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question_text.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (formData.question_type !== 'true_false' && formData.options.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    if (!formData.options.some(opt => opt.is_correct)) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        question_text: formData.question_text,
        question_type: formData.question_type,
        explanation_text: formData.explanation_text || undefined,
        related_article_url: formData.related_article_url || undefined,
        options: formData.options.map((opt, index) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order_in_question: opt.order_in_question !== undefined ? opt.order_in_question : index
        }))
      });
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionTypeChange = (type: 'multiple_choice' | 'multiple_select' | 'true_false') => {
    setFormData(prev => {
      if (type === 'true_false') {
        return {
          ...prev,
          question_type: type,
          options: [
            { id: 0, option_text: 'True', is_correct: false, order_in_question: 0, question_id: 0 },
            { id: 0, option_text: 'False', is_correct: false, order_in_question: 1, question_id: 0 }
          ]
        };
      } else {
        // Ensure at least 2 options for multiple choice/select
        const options = prev.options.length >= 2 ? prev.options : [
          ...prev.options,
          ...Array(Math.max(2 - prev.options.length, 0)).fill(null).map((_, i) => ({
            id: 0,
            option_text: '',
            is_correct: false,
            order_in_question: prev.options.length + i,
            question_id: 0
          }))
        ];
        return {
          ...prev,
          question_type: type,
          options
        };
      }
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: 0,
          option_text: '',
          is_correct: false,
          order_in_question: prev.options.length,
          question_id: 0
        }
      ]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((opt, i) => ({
        ...opt,
        order_in_question: i
      }))
    }));
  };

  const updateOption = (index: number, updates: Partial<QuizQuestionOption>) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, ...updates } : opt
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type *
        </label>
        <select
          value={formData.question_type}
          onChange={(e) => handleQuestionTypeChange(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="multiple_choice">Multiple Choice (Single Answer)</option>
          <option value="multiple_select">Multiple Select (Multiple Answers)</option>
          <option value="true_false">True/False</option>
        </select>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <TipTapEditor
          content={formData.question_text}
          onChange={(content) => setFormData(prev => ({ ...prev, question_text: content }))}
          placeholder="Enter your question here..."
        />
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options *
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg">
              <input
                type={formData.question_type === 'multiple_select' ? 'checkbox' : 'radio'}
                checked={option.is_correct}
                onChange={(e) => updateOption(index, { is_correct: e.target.checked })}
                name={formData.question_type === 'multiple_select' ? undefined : 'correct-answer'}
                className="mt-1"
              />
              <input
                type="text"
                value={option.option_text}
                onChange={(e) => updateOption(index, { option_text: e.target.value })}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-600 hover:text-red-900 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {formData.question_type !== 'true_false' && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            + Add Option
          </button>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (shown after answering)
        </label>
        <textarea
          value={formData.explanation_text}
          onChange={(e) => setFormData(prev => ({ ...prev, explanation_text: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Explain why this answer is correct..."
        />
      </div>

      {/* Related Article */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Related Article URL (optional)
        </label>
        <input
          type="url"
          value={formData.related_article_url}
          onChange={(e) => setFormData(prev => ({ ...prev, related_article_url: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/article"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}

