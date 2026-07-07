import type { DashboardData } from '../types/domain';

// Mock data shaped after the `daily_activity` / `goals` / `ai_recommendations`
// Supabase tables. Swap this for real Supabase/API calls once those
// endpoints exist — pages consume this via getDashboardData() only.
export function getDashboardData(): DashboardData {
  return {
    greetingName: 'Alex',
    streakDays: 12,
    stats: [
      {
        id: 'focus',
        label: "Today's Focus",
        value: '4h 20m',
        icon: 'timer',
        progressPercent: 70,
        progressColorClass: 'progress-gradient',
        caption: '70% of daily goal',
      },
      {
        id: 'quiz-accuracy',
        label: 'Quiz Accuracy',
        value: '88%',
        icon: 'verified',
        progressPercent: 88,
        progressColorClass: 'bg-tertiary',
        caption: '+5% from last week',
      },
      {
        id: 'mastery',
        label: 'Mastery Progress',
        value: '65%',
        icon: 'school',
        progressPercent: 65,
        progressColorClass: 'bg-secondary',
        caption: 'On track for finals',
      },
    ],
    tasks: [
      { id: 't1', label: 'Complete Molecular Biology Chapter 4 Summary', status: 'pending', tag: 'High' },
      { id: 't2', label: 'Review Digital Twin strategy session', status: 'pending', tag: 'AI Pick' },
      { id: 't3', label: 'Math problem set #23', status: 'done', tag: 'Done' },
    ],
    deadlines: [
      { id: 'd1', title: 'Calculus Exam', subtitle: 'Unit 4: Integrals & Series', dueLabel: 'In 2 Days', urgent: true },
      { id: 'd2', title: 'History Essay', subtitle: 'The Industrial Revolution (Draft)', dueLabel: 'Next Thursday', urgent: false },
    ],
    activity: [
      { id: 'a1', title: 'Completed Lesson: Organic Chemistry Foundations', meta: '2 hours ago • Focus session: 45m', icon: 'menu_book' },
      { id: 'a2', title: 'Passed Quiz: Microeconomics 101', meta: 'Yesterday • Score: 92%', icon: 'task_alt' },
    ],
    recommendations: [
      {
        id: 'r1',
        title: 'Review Organic Chemistry',
        body: 'Based on your last quiz results, focus on carbon-carbon double bonds for better mastery.',
        ctaLabel: 'Start Review',
      },
      {
        id: 'r2',
        title: 'Daily Strategy Session',
        body: 'Your energy levels are peak. This is the best time for Calculus problems.',
        ctaLabel: "Let's go",
      },
    ],
  };
}
