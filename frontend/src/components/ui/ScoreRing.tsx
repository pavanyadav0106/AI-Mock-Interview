import React, { useEffect, useRef } from 'react';

interface ScoreRingProps {
  score: number;        // 0–10
  size?: number;        // px
  strokeWidth?: number;
  label?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
}) => {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = clampedScore / 10;

  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);

  // Colour based on score
  const getColor = () => {
    if (clampedScore >= 8) return '#22c55e'; // green
    if (clampedScore >= 6) return '#8b5cf6'; // violet
    if (clampedScore >= 4) return '#f59e0b'; // amber
    return '#ef4444';                         // red
  };

  const getLabel = () => {
    if (clampedScore >= 8) return 'Excellent';
    if (clampedScore >= 6) return 'Good';
    if (clampedScore >= 4) return 'Average';
    return 'Needs Work';
  };

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDashoffset = String(circumference);
    // Trigger animation after mount
    const raf = requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      circle.style.strokeDashoffset = String(offset);
    });
    return () => cancelAnimationFrame(raf);
  }, [circumference, offset]);

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(255 255 255 / 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            ref={circleRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[rgb(var(--text-muted))]">
            / 10
          </span>
        </div>
      </div>

      {label !== undefined ? (
        <span className="text-sm font-semibold" style={{ color }}>
          {label}
        </span>
      ) : (
        <span className="text-sm font-semibold" style={{ color }}>
          {getLabel()}
        </span>
      )}
    </div>
  );
};
