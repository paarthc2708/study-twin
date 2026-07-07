import type { ChartBar, ChartPoint, HeatmapCell, TopicMastery } from '../types/domain';

// Mock data shaped after the `study_sessions` / `quiz_attempts` /
// `topic_mastery` / `daily_activity` Supabase tables.
export function getMasteryPercent(): number {
  return 75;
}

export function getStudyHours(): ChartPoint[] {
  return [
    { label: 'Mon', value: 4 },
    { label: 'Tue', value: 3.2 },
    { label: 'Wed', value: 5 },
    { label: 'Thu', value: 4.1 },
    { label: 'Fri', value: 6.5 },
    { label: 'Sat', value: 5.8 },
    { label: 'Sun', value: 7.2 },
  ];
}

export function getQuizScores(): ChartBar[] {
  return [
    { label: 'Bio', value: 92, colorClass: 'bg-primary' },
    { label: 'Chem', value: 78, colorClass: 'bg-primary/80' },
    { label: 'Phys', value: 85, colorClass: 'bg-primary/60' },
    { label: 'Calc', value: 64, colorClass: 'bg-error/60' },
    { label: 'Hist', value: 96, colorClass: 'bg-primary' },
  ];
}

export function getTopicMastery(): TopicMastery[] {
  return [
    { id: 't1', topic: 'Cell Structure', category: 'Biology', percent: 88, colorClass: 'bg-primary', categoryColorClass: 'bg-primary/10 text-primary' },
    { id: 't2', topic: 'Organic Chem', category: 'Chemistry', percent: 72, colorClass: 'bg-tertiary', categoryColorClass: 'bg-tertiary/10 text-tertiary' },
    { id: 't3', topic: 'Thermodynamics', category: 'Physics', percent: 45, colorClass: 'bg-error', categoryColorClass: 'bg-primary/10 text-primary' },
    { id: 't4', topic: 'Calculus III', category: 'Math', percent: 94, colorClass: 'bg-primary', categoryColorClass: 'bg-tertiary/10 text-tertiary' },
  ];
}

const HEATMAP_MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];

// Deterministic pseudo-activity pattern (no Math.random()) so the heatmap
// renders identically on every load instead of re-rolling on each render.
export function getHeatmapCells(): HeatmapCell[] {
  const totalDays = 26 * 7;
  const cells: HeatmapCell[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const wave = Math.sin(i * 0.35) + Math.sin(i * 0.11) * 0.5;
    const level = Math.max(0, Math.min(4, Math.round(((wave + 1.5) / 3) * 4))) as HeatmapCell['level'];
    const dayOffset = totalDays - i;
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    cells.push({ date: date.toISOString().slice(0, 10), level });
  }
  return cells;
}

export function getHeatmapMonthLabels(): string[] {
  return HEATMAP_MONTH_LABELS;
}

export function getAiInsights() {
  return [
    {
      id: 'i1',
      icon: 'auto_awesome',
      iconColorClass: 'text-tertiary',
      iconBgClass: 'bg-tertiary-container/20',
      title: 'AI Insights',
      body: 'Your retention is 15% higher during morning sessions. Consider scheduling heavy topics before 10 AM.',
    },
    {
      id: 'i2',
      icon: 'timer',
      iconColorClass: 'text-primary',
      iconBgClass: 'bg-primary-container/20',
      title: 'Peak Focus',
      body: "You've maintained a deep focus state for an average of 42 minutes per session this week.",
    },
    {
      id: 'i3',
      icon: 'psychology_alt',
      iconColorClass: 'text-on-surface-variant',
      iconBgClass: 'bg-surface-container-highest',
      title: 'Memory Decay',
      body: "Three topics from 'Organic Chemistry' are nearing their review date. Start a refresh quiz soon.",
    },
  ];
}
