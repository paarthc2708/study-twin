import type { Milestone, RevisionCalendarCell, TimelineWeek, WeeklyScheduleDay } from '../types/domain';

// Mock data shaped after the `goals` / `study_sessions` Supabase tables.
export function getTimelineWeeks(): TimelineWeek[] {
  return [
    { id: 'w1', label: 'Week 1', caption: 'Foundations', status: 'done' },
    { id: 'w2', label: 'Week 2', caption: 'Deep Dive', status: 'active' },
    { id: 'w3', label: 'Week 3', caption: 'Application', status: 'upcoming' },
    { id: 'w4', label: 'Week 4', caption: 'Review & Final', status: 'upcoming' },
  ];
}

export function getWeeklySchedule(): WeeklyScheduleDay[] {
  return [
    {
      id: 'mon',
      day: 'Mon',
      date: '14',
      title: '2h Physics: Thermodynamics',
      tags: ['Theory', 'Practice Quiz'],
      status: 'completed',
    },
    {
      id: 'tue',
      day: 'Tue',
      date: '15',
      title: '1.5h Calculus: Integrals',
      tags: ['Advanced', 'Revision'],
      status: 'upcoming',
      actionLabel: 'Start Session',
    },
    {
      id: 'wed',
      day: 'Wed',
      date: '16',
      title: 'Calculus Masterclass + Twin AI Sync',
      tags: ['High Priority', 'Spaced Repetition'],
      status: 'today',
      actionLabel: 'Continue',
    },
  ];
}

export function getMilestones(): Milestone[] {
  return [
    { id: 'm1', label: 'Unit 3 Quiz: Optics', date: 'Oct 18, 2024', done: true },
    { id: 'm2', label: 'Calculus Final Assessment', date: 'Oct 24, 2024', done: false },
    { id: 'm3', label: 'Peer Study Group Sync', date: 'Oct 26, 2024', done: false },
  ];
}

export function getRevisionCalendar(): RevisionCalendarCell[] {
  const cells: RevisionCalendarCell[] = [29, 30].map((day) => ({ day, variant: 'muted' }));
  const focused = new Set([2, 9]);
  const spaced = new Set([4, 17]);
  const today = 16;
  for (let day = 1; day <= 19; day += 1) {
    if (day === today) {
      cells.push({ day, variant: 'today' });
    } else if (focused.has(day)) {
      cells.push({ day, variant: 'focused' });
    } else if (spaced.has(day)) {
      cells.push({ day, variant: 'spaced' });
    } else {
      cells.push({ day, variant: 'none' });
    }
  }
  return cells;
}

export function getAiInsight(): string {
  return 'Based on your current retention pace in Calculus, I recommend an extra 30m deep-focus session this Wednesday to solidify Integration techniques.';
}
