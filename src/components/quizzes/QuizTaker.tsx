'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionDisplay from './QuestionDisplay';
import ProgressIndicator from './ProgressIndicator';
import QuizTimer from './QuizTimer';
import { QuizQuestion, QuizAttempt } from '@/types/quiz';
import toast from 'react-hot-toast';

interface QuizTakerProps {
  attempt: QuizAttempt;
  questions: QuizQuestion[];
  onComplete: (attemptId: number) => void;
}

export default function QuizTaker({ attempt, questions, onComplete }: QuizTakerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number[] }>({});
  const [timeSpent, setTimeSpent] = useState<{ [questionId: number]: number }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (optionId: number) => {
    if (!currentQuestion) return;

    setSelectedAnswers(prev => {
      const currentAnswers = prev[currentQuestion.id] || [];
      
      if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') {
        // Single answer
        return { ...prev, [currentQuestion.id]: [optionId] };
      } else {
        // Multiple select
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [currentQuestion.id]: currentAnswers.filter(id => id !== optionId) };
        } else {
          return { ...prev, [currentQuestion.id]: [...currentAnswers, optionId] };
        }
      }
    });
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);
    setTimeSpent(prev => ({ ...prev, [currentQuestion.id]: timeElapsed }));

    // Submit answer
    const selectedOptionIds = selectedAnswers[currentQuestion.id] || [];
    if (selectedOptionIds.length === 0) {
      toast.error('Please select an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/quizzes/${attempt.quiz?.slug || 'quiz'}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attempt.id,
          question_id: currentQuestion.id,
          selected_option_ids: selectedOptionIds,
          time_spent: timeElapsed
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Last question, complete quiz
        await handleComplete();
      }
    } catch (error) {
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentQuestion) return;

    // Submit last answer if not already submitted
    const timeElapsed = Math.round((Date.now() - questionStartTime) / 1000);
    const selectedOptionIds = selectedAnswers[currentQuestion.id] || [];
    
    if (selectedOptionIds.length > 0) {
      try {
        await fetch(`/api/quizzes/${attempt.quiz?.slug || 'quiz'}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attempt_id: attempt.id,
            question_id: currentQuestion.id,
            selected_option_ids: selectedOptionIds,
            time_spent: timeElapsed
          })
        });
      } catch (error) {
        console.error('Failed to submit last answer:', error);
      }
    }

    // Complete quiz
    try {
      setIsCompleting(true);
      const response = await fetch(`/api/quizzes/${attempt.quiz?.slug || 'quiz'}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attempt.id
        })
      });

      if (!response.ok) throw new Error('Failed to complete quiz');

      const data = await response.json();
      onComplete(attempt.id);
    } catch (error) {
      toast.error('Failed to complete quiz');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">No questions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <ProgressIndicator
          current={currentQuestionIndex + 1}
          total={questions.length}
          progress={progress}
        />

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <QuestionDisplay
            question={currentQuestion}
            selectedAnswers={selectedAnswers[currentQuestion.id] || []}
            onAnswerSelect={handleAnswerSelect}
            questionNumber={currentQuestionIndex + 1}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting || isCompleting}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting || (selectedAnswers[currentQuestion.id] || []).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Next'}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCompleting || (selectedAnswers[currentQuestion.id] || []).length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? 'Completing...' : 'Complete Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

