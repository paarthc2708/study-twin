import type { CognitiveMetric } from '../../types/domain';

interface RadarChartProps {
  axes: CognitiveMetric[];
}

const CENTER = 50;
const MAX_RADIUS = 42;
const LABEL_RADIUS = 56;

export function RadarChart({ axes }: RadarChartProps) {
  const angleStep = (2 * Math.PI) / axes.length;

  function pointAt(index: number, radius: number) {
    const angle = -Math.PI / 2 + index * angleStep;
    return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
  }

  const dataPoints = axes.map((axis, i) => pointAt(i, (axis.value / 100) * MAX_RADIUS)).map((p) => `${p.x},${p.y}`).join(' ');
  const outlinePoints = axes.map((_, i) => pointAt(i, MAX_RADIUS)).map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-full h-full border border-outline rounded-full" />
        <div className="absolute w-3/4 h-3/4 border border-outline rounded-full" />
        <div className="absolute w-1/2 h-1/2 border border-outline rounded-full" />
      </div>
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
        <polygon className="text-outline/30" fill="none" points={outlinePoints} stroke="currentColor" strokeWidth={0.5} />
        <polygon fill="rgba(70, 72, 212, 0.2)" points={dataPoints} stroke="#4648d4" strokeWidth={2} />
      </svg>
      {axes.map((axis, index) => {
        const { x, y } = pointAt(index, LABEL_RADIUS);
        return (
          <div
            key={axis.axis}
            className="absolute font-label-sm text-on-surface-variant text-[11px] whitespace-nowrap"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {axis.axis} ({axis.value}%)
          </div>
        );
      })}
    </div>
  );
}
