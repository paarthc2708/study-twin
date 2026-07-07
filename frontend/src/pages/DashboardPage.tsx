import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { getDashboardData } from '../services/dashboardService';

const ICON_COLOR_CLASS: Record<string, string> = {
  focus: 'text-primary',
  'quiz-accuracy': 'text-tertiary',
  mastery: 'text-secondary',
};

const CALENDAR_DAYS: { day: string; variant: 'muted' | 'default' | 'today' | 'deadline' }[] = [
  { day: '12', variant: 'muted' },
  { day: '13', variant: 'muted' },
  { day: '14', variant: 'today' },
  { day: '15', variant: 'default' },
  { day: '16', variant: 'default' },
  { day: '17', variant: 'deadline' },
  { day: '18', variant: 'default' },
];

export function DashboardPage() {
  const [data] = useState(() => getDashboardData());
  const [tasks, setTasks] = useState(data.tasks);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: task.status === 'done' ? 'pending' : 'done' } : task)),
    );
  }

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between items-end gap-md">
        <div>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Good morning, {data.greetingName}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            You're on a <span className="font-bold text-primary">{data.streakDays}-day streak!</span> 🔥
          </p>
        </div>
        <div className="flex items-center gap-sm glass-card px-md py-sm rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full ai-pulse" />
          <span className="font-label-sm text-label-sm font-bold text-primary">AI Twin Synchronized</span>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {data.stats.map((stat) => (
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
              <button className="text-primary font-label-sm text-label-sm hover:underline">Manage Tasks</button>
            </div>
            <div className="space-y-md">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-md p-md hover:bg-white/40 rounded-lg transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
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
          </GlassCard>

          <GlassCard className="p-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Upcoming Deadlines</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {data.deadlines.map((deadline) => (
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
          </GlassCard>

          <GlassCard className="p-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Recent Activity</h3>
            <div className="space-y-lg">
              {data.activity.map((item) => (
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
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className="p-md bg-white/60 border border-white/80 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <p className="font-bold text-primary mb-xs">{rec.title}</p>
                    <p className="text-label-sm text-on-surface-variant">{rec.body}</p>
                    <button className="mt-md w-full py-sm bg-primary text-on-primary rounded-lg text-label-sm font-bold">
                      {rec.ctaLabel}
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
              <p className="font-bold">October 2024</p>
              <div className="flex gap-sm">
                <MaterialIcon name="chevron_left" className="cursor-pointer hover:text-primary" />
                <MaterialIcon name="chevron_right" className="cursor-pointer hover:text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-xs text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
                <span key={index} className="text-label-sm text-outline-variant">
                  {label}
                </span>
              ))}
              {CALENDAR_DAYS.map(({ day, variant }) => (
                <span
                  key={day}
                  className={`py-xs text-label-sm rounded-full relative ${
                    variant === 'today'
                      ? 'bg-primary text-on-primary font-bold'
                      : variant === 'deadline'
                        ? 'bg-error/10 text-error font-bold'
                        : variant === 'muted'
                          ? 'text-outline-variant'
                          : ''
                  }`}
                >
                  {day}
                  {variant === 'deadline' && (
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
