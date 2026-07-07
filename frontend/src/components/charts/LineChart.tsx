import type { ChartPoint } from '../../types/domain';

interface LineChartProps {
  points: ChartPoint[];
  unit?: string;
}

export function LineChart({ points, unit = 'h' }: LineChartProps) {
  const width = 700;
  const height = 160;
  const max = Math.max(...points.map((p) => p.value), 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((point, index) => {
    const x = index * stepX;
    const y = height - (point.value / max) * height;
    return `${x},${y}`;
  });

  return (
    <div className="relative h-64 w-full flex items-end justify-between px-md">
      <svg className="absolute inset-0 w-full h-full px-md pb-8" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-grad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#4648d4" />
            <stop offset="100%" stopColor="#8455ef" />
          </linearGradient>
        </defs>
        <path d={`M ${coords.join(' L ')}`} fill="none" stroke="url(#line-grad)" strokeLinecap="round" strokeWidth={4} />
      </svg>
      {points.map((point) => (
        <div key={point.label} className="flex flex-col items-center gap-unit text-label-sm text-on-surface-variant z-10">
          <span>
            {point.value}
            {unit}
          </span>
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}
