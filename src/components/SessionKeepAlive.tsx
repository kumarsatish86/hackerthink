'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionKeepAlive() {
  const { data: session, status, update } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated' && recoveryAttempts < 3) {
      const recoveryTimeout = setTimeout(() => {
        update();
        setRecoveryAttempts((prev) => prev + 1);
      }, 2000 * (recoveryAttempts + 1));
      return () => clearTimeout(recoveryTimeout);
    }
  }, [status, recoveryAttempts, update]);

  useEffect(() => {
    if (status === 'authenticated') {
      setRecoveryAttempts(0);
    }
  }, [status]);

  // Keep session warm — do NOT put timeLeft in deps (that recreated intervals every second).
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    const keepAlive = setInterval(() => {
      update();
    }, 20 * 60 * 1000);

    const warnAt = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(5 * 60);
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(keepAlive);
      clearTimeout(warnAt);
    };
  }, [status, session, update]);

  useEffect(() => {
    if (!showWarning) return;
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [showWarning]);

  useEffect(() => {
    if (showWarning && timeLeft > 0 && timeLeft <= 60) {
      update();
      setShowWarning(false);
      setTimeLeft(0);
    }
  }, [showWarning, timeLeft, update]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-4 right-4 z-50 rounded-md border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-800 shadow-lg">
      <div className="flex items-center space-x-2">
        <span className="text-yellow-600">⚠️</span>
        <div>
          <p className="font-medium">Session Expiring Soon</p>
          <p className="text-sm">
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            update();
            setShowWarning(false);
            setTimeLeft(0);
          }}
          className="ml-2 rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
        >
          Extend
        </button>
      </div>
    </div>
  );
}
