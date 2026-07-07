import type { HeatmapCell } from '../../types/domain';

const LEVEL_CLASS = ['bg-surface-container-highest', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'];

interface HeatmapProps {
  cells: HeatmapCell[];
  monthLabels: string[];
}

export function Heatmap({ cells, monthLabels }: HeatmapProps) {
  return (
    <div>
      <div className="grid grid-cols-[repeat(26,1fr)] gap-2 overflow-x-auto pb-md">
        {cells.map((cell) => (
          <div key={cell.date} title={cell.date} className={`heatmap-cell ${LEVEL_CLASS[cell.level]} w-full h-3`} />
        ))}
      </div>
      <div className="flex justify-between mt-md px-md text-label-sm text-on-surface-variant font-mono-code">
        {monthLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
