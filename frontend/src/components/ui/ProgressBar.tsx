interface ProgressBarProps {
  percent: number;
  colorClassName?: string;
  trackClassName?: string;
}

export function ProgressBar({
  percent,
  colorClassName = 'progress-gradient',
  trackClassName = 'bg-surface-container',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-1 w-full rounded-full overflow-hidden ${trackClassName}`}>
      <div className={`h-full ${colorClassName}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
