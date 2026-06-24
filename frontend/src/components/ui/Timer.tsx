import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  durationSeconds: number;   // time per question
  onTimeUp: () => void;
  questionIndex: number;     // reset timer whenever question changes
  paused?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  durationSeconds,
  onTimeUp,
  questionIndex,
  paused = false,
}) => {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledRef = useRef(false);

  // Reset whenever question changes
  useEffect(() => {
    setRemaining(durationSeconds);
    calledRef.current = false;
  }, [questionIndex, durationSeconds]);

  // Countdown
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (!calledRef.current) {
            calledRef.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [questionIndex, paused, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const pct = remaining / durationSeconds;
  const isUrgent = pct <= 0.25;
  const isWarning = pct <= 0.5;

  const color = isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : '#22c55e';

  const bgColor = isUrgent
    ? 'rgb(239 68 68 / 0.1)'
    : isWarning
    ? 'rgb(245 158 11 / 0.1)'
    : 'rgb(34 197 94 / 0.1)';

  const borderColor = isUrgent
    ? 'rgb(239 68 68 / 0.3)'
    : isWarning
    ? 'rgb(245 158 11 / 0.3)'
    : 'rgb(34 197 94 / 0.3)';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] border font-mono font-bold text-sm transition-all duration-500 ${isUrgent ? 'animate-countdown-pulse' : ''}`}
      style={{ background: bgColor, borderColor, color }}
    >
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6.5" />
        <path strokeLinecap="round" d="M8 4.5V8l2 2" />
      </svg>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
