import { supabase } from '../lib/supabaseClient';
import { addTask, toggleGoal } from './strategyService';
import type { ActivityItem, Deadline, DashboardStat, Recommendation, Task } from '../types/domain';

export { addTask, toggleGoal };

export async function getGreeting(userId: string): Promise<{ name: string; streakDays: number }> {
  const { data, error } = await supabase.from('profiles').select('full_name, current_streak_days').eq('id', userId).single();
  if (error) throw error;
  return { name: (data.full_name as string)?.split(' ')[0] || 'there', streakDays: data.current_streak_days as number };
}

const DAILY_GOAL_MINUTES = 240;

export async function getStats(userId: string): Promise<DashboardStat[]> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [{ data: activityToday }, { data: recentAttempts }, { data: olderAttempts }, { data: courses }] = await Promise.all([
    supabase.from('daily_activity').select('minutes_studied').eq('user_id', userId).eq('activity_date', today).maybeSingle(),
    supabase
      .from('quiz_attempts')
      .select('accuracy_percent')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', weekAgo.toISOString()),
    supabase
      .from('quiz_attempts')
      .select('accuracy_percent')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', twoWeeksAgo.toISOString())
      .lt('completed_at', weekAgo.toISOString()),
    supabase.from('courses').select('mastery_percent').eq('user_id', userId).eq('is_archived', false),
  ]);

  const minutesToday = (activityToday as { minutes_studied: number } | null)?.minutes_studied ?? 0;
  const focusPercent = Math.min(100, Math.round((minutesToday / DAILY_GOAL_MINUTES) * 100));
  const hours = Math.floor(minutesToday / 60);
  const minutes = minutesToday % 60;

  const recent = (recentAttempts ?? []) as { accuracy_percent: number }[];
  const older = (olderAttempts ?? []) as { accuracy_percent: number }[];
  const recentAvg = recent.length ? recent.reduce((s, a) => s + a.accuracy_percent, 0) / recent.length : 0;
  const olderAvg = older.length ? older.reduce((s, a) => s + a.accuracy_percent, 0) / older.length : 0;
  const delta = Math.round(recentAvg - olderAvg);

  const courseRows = (courses ?? []) as { mastery_percent: number }[];
  const masteryAvg = courseRows.length ? Math.round(courseRows.reduce((s, c) => s + c.mastery_percent, 0) / courseRows.length) : 0;

  return [
    {
      id: 'focus',
      label: "Today's Focus",
      value: `${hours}h ${minutes}m`,
      icon: 'timer',
      progressPercent: focusPercent,
      progressColorClass: 'progress-gradient',
      caption: `${focusPercent}% of daily goal`,
    },
    {
      id: 'quiz-accuracy',
      label: 'Quiz Accuracy',
      value: recent.length ? `${Math.round(recentAvg)}%` : '—',
      icon: 'verified',
      progressPercent: Math.round(recentAvg),
      progressColorClass: 'bg-tertiary',
      caption: recent.length === 0 ? 'No quizzes this week yet' : older.length === 0 ? 'Keep it up!' : `${delta >= 0 ? '+' : ''}${delta}% from last week`,
    },
    {
      id: 'mastery',
      label: 'Mastery Progress',
      value: courseRows.length ? `${masteryAvg}%` : '—',
      icon: 'school',
      progressPercent: masteryAvg,
      progressColorClass: 'bg-secondary',
      caption: courseRows.length === 0 ? 'Add a course to get started' : 'Across your active courses',
    },
  ];
}

interface GoalRow {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | null;
  status: 'pending' | 'completed';
  due_date: string | null;
}

export async function getTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, priority, status, due_date')
    .eq('user_id', userId)
    .eq('goal_type', 'task')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(6);
  if (error) throw error;
  return (data as GoalRow[]).map((row) => ({
    id: row.id,
    label: row.title,
    status: row.status === 'completed' ? 'done' : 'pending',
    tag: row.priority === 'high' ? 'High' : row.priority ?? 'Task',
  }));
}

export async function getDeadlines(userId: string): Promise<Deadline[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, description, due_date')
    .eq('user_id', userId)
    .eq('goal_type', 'deadline')
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .limit(2);
  if (error) throw error;

  const today = new Date();
  return (data as { id: string; title: string; description: string | null; due_date: string | null }[]).map((row) => {
    let dueLabel = 'No date set';
    let urgent = false;
    if (row.due_date) {
      const due = new Date(row.due_date + 'T00:00:00');
      const daysAway = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      urgent = daysAway <= 3;
      dueLabel = daysAway < 0 ? 'Overdue' : daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} Days`;
    }
    return { id: row.id, title: row.title, subtitle: row.description ?? '', dueLabel, urgent };
  });
}

export async function getActivity(userId: string): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, accuracy_percent, completed_at, quizzes!inner(title)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(3);
  if (error) throw error;

  return (data as unknown as { id: string; accuracy_percent: number; completed_at: string; quizzes: { title: string } }[]).map((row) => ({
    id: row.id,
    title: `Passed Quiz: ${row.quizzes.title}`,
    meta: `${new Date(row.completed_at).toLocaleDateString()} • Score: ${Math.round(row.accuracy_percent)}%`,
    icon: 'task_alt',
  }));
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('id, title, body')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(2);
  if (error) throw error;
  return (data as { id: string; title: string; body: string }[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    ctaLabel: 'View Details',
  }));
}

export async function dismissRecommendation(id: string): Promise<void> {
  const { error } = await supabase.from('ai_recommendations').update({ is_dismissed: true }).eq('id', id);
  if (error) throw error;
}

export interface CalendarCell {
  day: number;
  variant: 'muted' | 'default' | 'today' | 'deadline';
}

export async function getCalendarMonth(userId: string, year: number, month: number): Promise<CalendarCell[]> {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('goals')
    .select('due_date')
    .eq('user_id', userId)
    .gte('due_date', monthStart)
    .lte('due_date', monthEnd);
  if (error) throw error;

  const dueDays = new Set((data as { due_date: string }[]).map((row) => new Date(row.due_date + 'T00:00:00').getDate()));

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < leadingBlanks; i += 1) {
    cells.push({ day: prevMonthDays - leadingBlanks + i + 1, variant: 'muted' });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (isCurrentMonth && day === now.getDate()) {
      cells.push({ day, variant: 'today' });
    } else if (dueDays.has(day)) {
      cells.push({ day, variant: 'deadline' });
    } else {
      cells.push({ day, variant: 'default' });
    }
  }
  return cells;
}
