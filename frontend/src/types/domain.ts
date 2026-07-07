export interface Task {
  id: string;
  label: string;
  status: 'pending' | 'done';
  tag: string;
}

export interface Deadline {
  id: string;
  title: string;
  subtitle: string;
  dueLabel: string;
  urgent: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  icon: string;
}

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  progressPercent: number;
  progressColorClass: string;
  caption: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface HeatmapCell {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface WeeklyScheduleDay {
  id: string;
  day: string;
  date: string;
  title: string;
  tags: string[];
  status: 'completed' | 'today' | 'upcoming';
  actionLabel?: string;
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  done: boolean;
}

export interface TimelineWeek {
  id: string;
  label: string;
  caption: string;
  status: 'done' | 'active' | 'upcoming';
}

export interface RevisionCalendarCell {
  day: number;
  variant: 'none' | 'muted' | 'focused' | 'spaced' | 'today';
}

export interface TopicMastery {
  id: string;
  topic: string;
  category: string;
  percent: number;
  colorClass: string;
  categoryColorClass: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartBar {
  label: string;
  value: number;
  colorClass: string;
}

export interface CognitiveMetric {
  axis: string;
  value: number;
}

export interface ConfidenceCalibration {
  id: string;
  subject: string;
  confidence: number;
  actual: number;
}

export interface ProfileSettings {
  fullName: string;
  avatarUrl: string | null;
  academicLevel: string;
  bio: string;
  plan: string;
  mentorStrictness: number;
  dailyReminders: boolean;
  pushAlerts: boolean;
  language: string;
  currentStreakDays: number;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
}
