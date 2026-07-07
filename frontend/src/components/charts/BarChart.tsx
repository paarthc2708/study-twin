import type { ChartBar } from '../../types/domain';

export function BarChart({ bars }: { bars: ChartBar[] }) {
  return (
    <div className="flex items-end justify-around h-72 pt-xl border-b border-outline-variant pb-md">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-md group w-12">
          <span className="text-label-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold">{bar.value}%</span>
          <div className={`w-full rounded-t-lg chart-bar ${bar.colorClass}`} style={{ height: `${bar.value}%` }} />
          <span className="text-label-sm text-on-surface-variant -rotate-45 mt-lg">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}
