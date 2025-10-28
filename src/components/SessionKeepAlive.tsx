'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionKeepAlive() {
  const { data: session, status, update } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  // Session recovery mechanism
  useEffect(() => {
    if (status === 'unauthenticated' && recoveryAttempts < 3) {
      // Try to recover session
      const recoveryTimeout = setTimeout(() => {
        console.log('Attempting session recovery...');
        update();
        setRecoveryAttempts(prev => prev + 1);
      }, 2000 * (recoveryAttempts + 1)); // Exponential backoff

      return () => clearTimeout(recoveryTimeout);
    }
  }, [status, recoveryAttempts, update]);

  // Reset recovery attempts when session is restored
  useEffect(() => {
    if (status === 'authenticated') {
      setRecoveryAttempts(0);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Refresh session every 20 minutes to keep it alive
      const interval = setInterval(() => {
        update(); // This will refresh the session
      }, 20 * 60 * 1000); // 20 minutes

      // Show warning 5 minutes before session expires
      const warningInterval = setInterval(() => {
        setShowWarning(true);
        setTimeLeft(5 * 60); // 5 minutes in seconds
      }, 15 * 60 * 1000); // 15 minutes

      // Countdown timer for warning
      const countdownInterval = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft(prev => prev - 1);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(warningInterval);
        clearInterval(countdownInterval);
      };
    }
  }, [status, session, update, timeLeft]);

  // Auto-refresh session when warning is shown
  useEffect(() => {
    if (showWarning && timeLeft <= 60) { // Auto-refresh when 1 minute left
      update();
      setShowWarning(false);
      setTimeLeft(0);
    }
  }, [showWarning, timeLeft, update]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-md shadow-lg">
      <div className="flex items-center space-x-2">
        <span className="text-yellow-600">⚠️</span>
        <div>
          <p className="font-medium">Session Expiring Soon</p>
          <p className="text-sm">
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
        <button
          onClick={() => {
            update();
            setShowWarning(false);
            setTimeLeft(0);
          }}
          className="ml-2 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
        >
          Extend
        </button>
      </div>
    </div>
  );
}
