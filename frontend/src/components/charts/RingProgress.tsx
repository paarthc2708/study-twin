import type { ReactNode } from 'react';

interface RingProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  progressClassName?: string;
  children?: ReactNode;
}

export function RingProgress({
  percent,
  size = 192,
  strokeWidth = 12,
  trackClassName = 'text-surface-container-high',
  progressClassName = 'text-primary',
  children,
}: RingProgressProps) {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle className={trackClassName} cx={center} cy={center} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} />
        <circle
          className={progressClassName}
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
