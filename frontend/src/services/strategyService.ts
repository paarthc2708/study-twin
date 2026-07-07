import { supabase } from '../lib/supabaseClient';
import { generateInsight } from './aiService';
import type { Milestone, RevisionCalendarCell, TimelineWeek, WeeklyScheduleDay } from '../types/domain';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface GoalRow {
  id: string;
  title: string;
  goal_type: 'task' | 'deadline' | 'milestone';
  priority: 'low' | 'medium' | 'high' | null;
  due_date: string | null;
  status: 'pending' | 'completed';
}

async function fetchGoals(userId: string, goalType: 'task' | 'milestone'): Promise<GoalRow[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, goal_type, priority, due_date, status')
    .eq('user_id', userId)
    .eq('goal_type', goalType)
    .order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as GoalRow[];
}

export async function getWeeklySchedule(userId: string): Promise<WeeklyScheduleDay[]> {
  const rows = await fetchGoals(userId, 'task');
  const today = todayIso();

  return rows.slice(0, 6).map((row) => {
    const dueDate = row.due_date ? new Date(row.due_date + 'T00:00:00') : null;
    const status: WeeklyScheduleDay['status'] =
      row.status === 'completed' ? 'completed' : row.due_date === today ? 'today' : 'upcoming';
    const tags = [row.priority === 'high' ? 'High Priority' : row.priority ? row.priority : 'Task'];

    return {
      id: row.id,
      day: dueDate ? DAY_LABELS[dueDate.getDay()] : '—',
      date: dueDate ? String(dueDate.getDate()) : '—',
      title: row.title,
      tags,
      status,
      actionLabel: status === 'completed' ? undefined : status === 'today' ? 'Continue' : 'Start Session',
    };
  });
}

export async function addTask(userId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .insert({ user_id: userId, title, goal_type: 'task', due_date: todayIso(), status: 'pending' });
  if (error) throw error;
}

export async function getMilestones(userId: string): Promise<Milestone[]> {
  const rows = await fetchGoals(userId, 'milestone');
  return rows.map((row) => ({
    id: row.id,
    label: row.title,
    date: row.due_date
      ? new Date(row.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No date set',
    done: row.status === 'completed',
  }));
}

export async function addMilestone(userId: string, label: string, dueDate: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .insert({ user_id: userId, title: label, goal_type: 'milestone', due_date: dueDate || null, status: 'pending' });
  if (error) throw error;
}

export async function toggleGoal(id: string, done: boolean): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ status: done ? 'completed' : 'pending', completed_at: done ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export async function startStudySession(userId: string): Promise<void> {
  const { error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, session_type: 'focus', started_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getTimelineWeeks(userId: string): Promise<TimelineWeek[]> {
  const [tasks, milestones] = await Promise.all([fetchGoals(userId, 'task'), fetchGoals(userId, 'milestone')]);
  const all = [...tasks, ...milestones];
  const percentComplete = all.length === 0 ? 0 : (all.filter((g) => g.status === 'completed').length / all.length) * 100;
  const activeIndex = Math.min(3, Math.floor(percentComplete / 25));

  const labels = [
    { label: 'Week 1', caption: 'Foundations' },
    { label: 'Week 2', caption: 'Deep Dive' },
    { label: 'Week 3', caption: 'Application' },
    { label: 'Week 4', caption: 'Review & Final' },
  ];
  return labels.map((entry, index) => ({
    id: `w${index + 1}`,
    ...entry,
    status: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming',
  }));
}

export async function getAiInsight(userId: string): Promise<string> {
  const { data: existing, error } = await supabase
    .from('ai_recommendations')
    .select('id, body')
    .eq('user_id', userId)
    .eq('recommendation_type', 'strategy_session')
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (existing) return existing.body;

  const [tasks, milestones] = await Promise.all([fetchGoals(userId, 'task'), fetchGoals(userId, 'milestone')]);
  const [insight] = await generateInsight('strategy', {
    pendingTasks: tasks.filter((t) => t.status === 'pending').map((t) => t.title),
    upcomingMilestones: milestones.filter((m) => m.status === 'pending').map((m) => m.title),
  });
  if (!insight) return "Add a few tasks and milestones to get a personalized study strategy insight.";

  const { error: insertError } = await supabase
    .from('ai_recommendations')
    .insert({ user_id: userId, title: insight.title, body: insight.body, recommendation_type: 'strategy_session' });
  if (insertError) throw insertError;

  return insight.body;
}

export async function acceptAiInsight(userId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_recommendations')
    .update({ is_dismissed: true })
    .eq('user_id', userId)
    .eq('recommendation_type', 'strategy_session')
    .eq('is_dismissed', false);
  if (error) throw error;
}

export async function getRevisionCalendar(userId: string): Promise<RevisionCalendarCell[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const todayDate = now.getDate();

  const { data, error } = await supabase
    .from('flashcards')
    .select('next_review_date, flashcard_decks!inner(user_id)')
    .eq('flashcard_decks.user_id', userId);
  if (error) throw error;

  const countsByDay = new Map<number, number>();
  for (const row of data as { next_review_date: string }[]) {
    const reviewDate = new Date(row.next_review_date + 'T00:00:00');
    if (reviewDate.getFullYear() === year && reviewDate.getMonth() === month) {
      countsByDay.set(reviewDate.getDate(), (countsByDay.get(reviewDate.getDate()) ?? 0) + 1);
    }
  }

  const cells: RevisionCalendarCell[] = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = leadingBlanks - 1; i >= 0; i -= 1) {
    cells.push({ day: prevMonthDays - i, variant: 'muted' });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (day === todayDate) {
      cells.push({ day, variant: 'today' });
      continue;
    }
    const count = countsByDay.get(day) ?? 0;
    cells.push({ day, variant: count >= 3 ? 'focused' : count > 0 ? 'spaced' : 'none' });
  }
  return cells;
}
