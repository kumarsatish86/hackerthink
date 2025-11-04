'use client';

import { useState, useEffect } from 'react';

interface QuizTimerProps {
  timeLimit?: number; // in minutes
  onTimeUp?: () => void;
}

export default function QuizTimer({ timeLimit, onTimeUp }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!timeLimit) return;

    const totalSeconds = timeLimit * 60;
    setTimeRemaining(totalSeconds);

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, onTimeUp]);

  if (!timeLimit || timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 60;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
      isLowTime ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      <span className="text-sm">Time Remaining:</span>
      <span className="text-lg font-mono">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

