import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import {
  addTask,
  dismissRecommendation,
  getActivity,
  getCalendarMonth,
  getDeadlines,
  getGreeting,
  getRecommendations,
  getStats,
  getTasks,
  toggleGoal,
} from '../services/dashboardService';

const ICON_COLOR_CLASS: Record<string, string> = {
  focus: 'text-primary',
  'quiz-accuracy': 'text-tertiary',
  mastery: 'text-secondary',
};

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [newTaskLabel, setNewTaskLabel] = useState('');

  const loadAll = useCallback(async () => {
    const userId = user!.id;
    const [greeting, stats, tasks, deadlines, activity, recommendations] = await Promise.all([
      getGreeting(userId),
      getStats(userId),
      getTasks(userId),
      getDeadlines(userId),
      getActivity(userId),
      getRecommendations(userId),
    ]);
    return { greeting, stats, tasks, deadlines, activity, recommendations };
  }, [user]);
  const { data, loading, error, refetch } = useSupabaseQuery(loadAll, [user?.id]);

  const loadCalendar = useCallback(
    () => getCalendarMonth(user!.id, calendarYear, calendarMonth),
    [user, calendarYear, calendarMonth],
  );
  const { data: calendarCells, refetch: refetchCalendar } = useSupabaseQuery(loadCalendar, [user?.id, calendarYear, calendarMonth]);

  function changeMonth(delta: number) {
    let month = calendarMonth + delta;
    let year = calendarYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    setCalendarMonth(month);
    setCalendarYear(year);
  }

  async function handleToggleTask(id: string, done: boolean) {
    try {
      await toggleGoal(id, !done);
      refetch();
    } catch (err) {
      showToast(errorMessage(err, 'Could not update task.'));
    }
  }

  async function handleAddTask(event: FormEvent) {
    event.preventDefault();
    if (!newTaskLabel.trim() || !user) return;
    try {
      await addTask(user.id, newTaskLabel.trim());
      setNewTaskLabel('');
      refetch();
      refetchCalendar();
    } catch (err) {
      showToast(errorMessage(err, 'Could not add task.'));
    }
  }

  async function handleDismissRecommendation(id: string) {
    try {
      await dismissRecommendation(id);
      refetch();
    } catch (err) {
      showToast(errorMessage(err, 'Could not update recommendation.'));
    }
  }

  if (loading) return <div className="text-on-surface-variant">Loading your dashboard…</div>;
  if (error || !data) {
    return (
      <div className="text-center py-2xl space-y-md">
        <p className="text-error">{error}</p>
        <button onClick={refetch} className="text-primary font-bold hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const { greeting, stats, tasks, deadlines, activity, recommendations } = data;

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between items-end gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Good morning, {greeting.name}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            You're on a <span className="font-bold text-primary">{greeting.streakDays}-day streak!</span> 🔥
          </p>
        </div>
        <div className="flex items-center gap-sm glass-card px-md py-sm rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full ai-pulse" />
          <span className="font-label-sm text-label-sm font-bold text-primary">AI Twin Synchronized</span>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {stats.map((stat) => (
          <GlassCard key={stat.id} className="p-lg flex flex-col">
            <div className="flex justify-between items-start mb-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {stat.label}
              </span>
              <MaterialIcon name={stat.icon} className={ICON_COLOR_CLASS[stat.id] ?? 'text-primary'} />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">{stat.value}</span>
            <div className="mt-md">
              <ProgressBar percent={stat.progressPercent} colorClassName={stat.progressColorClass} />
            </div>
            <p className="text-label-sm mt-xs text-on-surface-variant">{stat.caption}</p>
          </GlassCard>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        <div className="lg:col-span-8 space-y-lg">
          <GlassCard className="p-lg">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">Today's Tasks</h3>
              <button onClick={() => navigate('/strategy')} className="text-primary font-label-sm text-label-sm hover:underline">
                Manage Tasks
              </button>
            </div>
            <div className="space-y-md">
              {tasks.length === 0 && <p className="text-on-surface-variant text-label-sm">No tasks yet — add one below.</p>}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-md p-md hover:bg-white/40 rounded-lg transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.status === 'done')}
                    className="w-6 h-6 border-2 border-primary-fixed-dim rounded-md flex items-center justify-center cursor-pointer group-hover:border-primary shrink-0"
                  >
                    {task.status === 'done' && (
                      <MaterialIcon name="check" className="text-primary" style={{ fontSize: '16px' }} />
                    )}
                  </button>
                  <span className={`flex-1 font-body-md ${task.status === 'done' ? 'line-through text-on-surface-variant' : ''}`}>
                    {task.label}
                  </span>
                  <span
                    className={`px-sm py-unit text-label-sm rounded ${
                      task.status === 'done'
                        ? 'bg-outline-variant/20 text-outline'
                        : task.tag === 'High'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {task.status === 'done' ? 'Done' : task.tag}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTask} className="flex gap-sm mt-md">
              <input
                value={newTaskLabel}
                onChange={(event) => setNewTaskLabel(event.target.value)}
                placeholder="Add a task…"
                className="flex-1 px-md py-sm bg-surface-container-low border-none rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-label-sm"
              />
              <button type="submit" className="px-lg py-sm bg-primary text-on-primary rounded-lg font-label-sm font-bold">
                Add
              </button>
            </form>
          </GlassCard>

          <GlassCard className="p-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Upcoming Deadlines</h3>
            {deadlines.length === 0 ? (
              <p className="text-on-surface-variant text-label-sm">No deadlines coming up.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className={`p-md rounded-xl border ${
                      deadline.urgent ? 'bg-error/5 border-error/10' : 'bg-secondary-container/30 border-outline-variant/20'
                    }`}
                  >
                    <div className={`flex items-center gap-sm mb-sm ${deadline.urgent ? 'text-error' : 'text-on-surface-variant'}`}>
                      <MaterialIcon name={deadline.urgent ? 'event_busy' : 'schedule'} className="text-md" />
                      <span className={`font-label-sm text-label-sm ${deadline.urgent ? 'font-bold' : ''}`}>{deadline.dueLabel}</span>
                    </div>
                    <p className="font-bold text-on-surface">{deadline.title}</p>
                    <p className="text-label-sm text-on-surface-variant">{deadline.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-on-surface-variant text-label-sm">Complete a quiz to see your activity here.</p>
            ) : (
              <div className="space-y-lg">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-md">
                    <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                      <MaterialIcon name={item.icon} className="text-tertiary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-lg">
          <GlassCard className="p-lg bg-gradient-to-br from-primary/5 to-tertiary/5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-sm mb-lg">
                <MaterialIcon name="auto_awesome" className="text-primary ai-pulse" />
                <h3 className="font-headline-md text-headline-md text-on-surface">AI Recommendations</h3>
              </div>
              <div className="space-y-md">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-md bg-white/60 border border-white/80 rounded-xl hover:shadow-md transition-shadow">
                    <p className="font-bold text-primary mb-xs">{rec.title}</p>
                    <p className="text-label-sm text-on-surface-variant">{rec.body}</p>
                    <button
                      onClick={() => handleDismissRecommendation(rec.id)}
                      className="mt-md w-full py-sm bg-primary text-on-primary rounded-lg text-label-sm font-bold"
                    >
                      Mark as Seen
                    </button>
                  </div>
                ))}
                <div className="p-md border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center py-xl">
                  <MaterialIcon name="upcoming" className="text-outline-variant text-4xl mb-sm" />
                  <p className="text-label-sm text-on-surface-variant">Completing more tasks unlocks better recommendations.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-lg">
            <div className="flex justify-between items-center mb-md">
              <p className="font-bold">
                {MONTH_LABELS[calendarMonth]} {calendarYear}
              </p>
              <div className="flex gap-sm">
                <button onClick={() => changeMonth(-1)}>
                  <MaterialIcon name="chevron_left" className="cursor-pointer hover:text-primary" />
                </button>
                <button onClick={() => changeMonth(1)}>
                  <MaterialIcon name="chevron_right" className="cursor-pointer hover:text-primary" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-xs text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                <span key={index} className="text-label-sm text-outline-variant">
                  {label}
                </span>
              ))}
              {calendarCells?.map((cell, index) => (
                <span
                  key={index}
                  className={`py-xs text-label-sm rounded-full relative ${
                    cell.variant === 'today'
                      ? 'bg-primary text-on-primary font-bold'
                      : cell.variant === 'deadline'
                        ? 'bg-error/10 text-error font-bold'
                        : cell.variant === 'muted'
                          ? 'text-outline-variant'
                          : ''
                  }`}
                >
                  {cell.day}
                  {cell.variant === 'deadline' && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-error rounded-full" />
                  )}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
