import { supabase } from '../lib/supabaseClient';
import { generateInsight } from './aiService';
import type { ChartBar, ChartPoint, HeatmapCell, TopicMastery } from '../types/domain';

const BAR_PALETTE = ['bg-primary', 'bg-primary/80', 'bg-primary/60', 'bg-tertiary', 'bg-tertiary/70'];

export async function getMasteryPercent(userId: string): Promise<{ percent: number; caption: string }> {
  const { data, error } = await supabase.from('topic_mastery').select('mastery_percent').eq('user_id', userId);
  if (error) throw error;
  const rows = data as { mastery_percent: number }[];
  if (rows.length === 0) {
    return { percent: 0, caption: 'Complete a few quizzes to start tracking topic mastery.' };
  }
  const percent = Math.round(rows.reduce((sum, r) => sum + r.mastery_percent, 0) / rows.length);
  const mastered = rows.filter((r) => r.mastery_percent >= 80).length;
  return { percent, caption: `You've mastered ${mastered} of ${rows.length} tracked topics.` };
}

type StudyRange = 'week' | 'month';

export async function getStudyHours(userId: string, range: StudyRange): Promise<ChartPoint[]> {
  const now = new Date();
  const daysBack = range === 'week' ? 7 : 28;
  const since = new Date(now);
  since.setDate(since.getDate() - daysBack);

  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, duration_minutes')
    .eq('user_id', userId)
    .gte('started_at', since.toISOString());
  if (error) throw error;

  const rows = data as { started_at: string; duration_minutes: number | null }[];

  if (range === 'week') {
    const buckets = new Array(7).fill(0);
    for (const row of rows) {
      const dayIndex = Math.floor((now.getTime() - new Date(row.started_at).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) buckets[6 - dayIndex] += row.duration_minutes ?? 0;
    }
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    return buckets.map((minutes, i) => ({ label: labels[i], value: Math.round((minutes / 60) * 10) / 10 }));
  }

  const buckets = new Array(4).fill(0);
  for (const row of rows) {
    const dayIndex = Math.floor((now.getTime() - new Date(row.started_at).getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.min(3, Math.floor(dayIndex / 7));
    buckets[3 - weekIndex] += row.duration_minutes ?? 0;
  }
  return buckets.map((minutes, i) => ({ label: `Week ${i + 1}`, value: Math.round((minutes / 60) * 10) / 10 }));
}

export async function getQuizScores(userId: string): Promise<ChartBar[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('accuracy_percent, completed_at, quizzes!inner(course_id, courses!inner(name))')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = data as unknown as { accuracy_percent: number; quizzes: { course_id: string; courses: { name: string } } }[];
  const seen = new Set<string>();
  const bars: ChartBar[] = [];
  for (const row of rows) {
    const courseId = row.quizzes.course_id;
    if (seen.has(courseId)) continue;
    seen.add(courseId);
    bars.push({
      label: row.quizzes.courses.name.slice(0, 8),
      value: Math.round(row.accuracy_percent),
      colorClass: BAR_PALETTE[bars.length % BAR_PALETTE.length],
    });
    if (bars.length >= 5) break;
  }
  return bars;
}

export async function getTopicMastery(userId: string): Promise<TopicMastery[]> {
  const { data, error } = await supabase
    .from('topic_mastery')
    .select('id, topic_name, mastery_percent, courses!inner(name)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(4);
  if (error) throw error;

  return (data as unknown as { id: string; topic_name: string; mastery_percent: number; courses: { name: string } }[]).map((row) => {
    const colorClass = row.mastery_percent >= 80 ? 'bg-primary' : row.mastery_percent >= 50 ? 'bg-tertiary' : 'bg-error';
    const categoryColorClass = row.mastery_percent >= 50 ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary';
    return {
      id: row.id,
      topic: row.topic_name,
      category: row.courses.name,
      percent: Math.round(row.mastery_percent),
      colorClass,
      categoryColorClass,
    };
  });
}

const HEATMAP_DAYS = 26 * 7;

export async function getHeatmapCells(userId: string): Promise<HeatmapCell[]> {
  const today = new Date();
  const since = new Date(today);
  since.setDate(since.getDate() - HEATMAP_DAYS + 1);

  const { data, error } = await supabase
    .from('daily_activity')
    .select('activity_date, minutes_studied')
    .eq('user_id', userId)
    .gte('activity_date', since.toISOString().slice(0, 10));
  if (error) throw error;

  const minutesByDate = new Map<string, number>();
  for (const row of data as { activity_date: string; minutes_studied: number }[]) {
    minutesByDate.set(row.activity_date, row.minutes_studied);
  }

  const cells: HeatmapCell[] = [];
  for (let i = 0; i < HEATMAP_DAYS; i += 1) {
    const date = new Date(since);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const minutes = minutesByDate.get(dateStr) ?? 0;
    const level = minutes === 0 ? 0 : minutes <= 30 ? 1 : minutes <= 60 ? 2 : minutes <= 120 ? 3 : 4;
    cells.push({ date: dateStr, level: level as HeatmapCell['level'] });
  }
  return cells;
}

export function getHeatmapMonthLabels(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  });
}

export interface AnalyticsInsight {
  id: string;
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
  title: string;
  body: string;
}

const INSIGHT_ICONS = [
  { icon: 'auto_awesome', iconColorClass: 'text-tertiary', iconBgClass: 'bg-tertiary-container/20' },
  { icon: 'timer', iconColorClass: 'text-primary', iconBgClass: 'bg-primary-container/20' },
  { icon: 'psychology_alt', iconColorClass: 'text-on-surface-variant', iconBgClass: 'bg-surface-container-highest' },
];

export async function getAiInsights(userId: string): Promise<AnalyticsInsight[]> {
  const { data: existing, error } = await supabase
    .from('ai_recommendations')
    .select('id, title, body')
    .eq('user_id', userId)
    .eq('recommendation_type', 'insight')
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(3);
  if (error) throw error;

  if (existing.length > 0) {
    return (existing as { id: string; title: string; body: string }[]).map((row, i) => ({ id: row.id, ...INSIGHT_ICONS[i % 3], title: row.title, body: row.body }));
  }

  const [studyHours, quizScores] = await Promise.all([getStudyHours(userId, 'week'), getQuizScores(userId)]);
  const generated = await generateInsight('analytics', { studyHoursThisWeek: studyHours, quizScoresBySubject: quizScores });
  if (generated.length === 0) return [];

  const rows = generated.map((insight) => ({
    user_id: userId,
    title: insight.title,
    body: insight.body,
    recommendation_type: 'insight',
  }));
  const { data: inserted, error: insertError } = await supabase.from('ai_recommendations').insert(rows).select('id, title, body');
  if (insertError) throw insertError;

  return (inserted as { id: string; title: string; body: string }[]).map((row, i) => ({ id: row.id, ...INSIGHT_ICONS[i % 3], title: row.title, body: row.body }));
}
