import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import {
  getAiInsight,
  getMilestones,
  getRevisionCalendar,
  getTimelineWeeks,
  getWeeklySchedule,
} from '../services/strategyService';

const CALENDAR_VARIANT_CLASS: Record<string, string> = {
  none: 'hover:bg-surface-container-low transition-colors cursor-pointer',
  muted: 'text-outline-variant/30',
  focused: 'bg-primary/20 border border-primary/40 relative',
  spaced: 'bg-tertiary/40 text-on-tertiary',
  today: 'bg-primary text-on-primary ring-4 ring-primary/20',
};

export function StudyStrategyPage() {
  const [timelineWeeks] = useState(() => getTimelineWeeks());
  const [schedule] = useState(() => getWeeklySchedule());
  const [milestones, setMilestones] = useState(() => getMilestones());
  const [calendar] = useState(() => getRevisionCalendar());
  const [aiInsight] = useState(() => getAiInsight());
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setProgressWidth(68), 100);
    return () => clearTimeout(timeout);
  }, []);

  function toggleMilestone(id: string) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  }

  return (
    <>
      <section className="space-y-md">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              Your 4-week Path to Mastery
            </h2>
            <p className="font-body-lg text-on-surface-variant">
              Focusing on <span className="font-bold text-primary">Advanced Physics & Calculus</span> preparation.
            </p>
          </div>
          <div className="hidden md:flex gap-sm">
            <span className="px-md py-xs bg-primary/10 text-primary rounded-full font-label-sm">Week 2 of 4</span>
            <span className="px-md py-xs bg-tertiary/10 text-tertiary rounded-full font-label-sm">68% Complete</span>
          </div>
        </div>
        <GlassCard className="rounded-2xl p-xl overflow-hidden relative">
          <div className="h-1 bg-surface-container relative rounded-full mb-lg overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-1000"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-gutter text-center relative">
            {timelineWeeks.map((week) => (
              <div key={week.id} className={`space-y-sm ${week.status === 'upcoming' ? 'opacity-40' : ''}`}>
                <div
                  className={`w-4 h-4 rounded-full mx-auto ${
                    week.status === 'upcoming' ? 'bg-outline-variant' : 'bg-primary ring-4 ring-primary/20 shadow-sm'
                  } ${week.status === 'active' ? 'animate-pulse' : ''}`}
                />
                <p className={`font-label-sm font-bold ${week.status === 'active' ? 'text-primary' : 'text-on-surface'}`}>
                  {week.label}
                </p>
                <p className="text-[12px] text-on-surface-variant">{week.caption}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        <div className="lg:col-span-8 space-y-md">
          <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
            <MaterialIcon name="calendar_month" className="text-primary" />
            Weekly Schedule
          </h3>
          <div className="space-y-sm">
            {schedule.map((entry) => (
              <GlassCard
                key={entry.id}
                className={`p-lg flex items-center gap-lg hover:translate-x-2 transition-transform duration-200 relative overflow-hidden ${
                  entry.status === 'today'
                    ? 'border-l-4 border-primary bg-primary/[0.03] ring-1 ring-primary/20'
                    : entry.status === 'completed'
                      ? 'border-l-4 border-primary'
                      : 'border-l-4 border-primary-container/20'
                }`}
              >
                {entry.status === 'today' && (
                  <div className="absolute top-0 right-0 px-md py-xs bg-primary text-on-primary font-label-sm rounded-bl-xl">
                    Today
                  </div>
                )}
                <div className="text-center w-12 shrink-0">
                  <p className={`font-label-sm uppercase ${entry.status === 'today' ? 'text-primary font-bold' : 'text-outline'}`}>
                    {entry.day}
                  </p>
                  <p className={`font-headline-md ${entry.status === 'today' ? 'text-primary font-bold' : entry.status === 'completed' ? 'text-primary' : 'text-on-surface'}`}>
                    {entry.date}
                  </p>
                </div>
                <div className="flex-1 space-y-xs">
                  <h4 className="font-label-sm font-bold text-on-surface">{entry.title}</h4>
                  <div className="flex gap-sm">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[12px] px-sm py-xs rounded ${
                          tag === 'High Priority'
                            ? 'bg-tertiary text-on-tertiary'
                            : tag === 'Theory' || tag === 'Advanced'
                              ? 'bg-primary-container/10 text-primary'
                              : tag === 'Practice Quiz'
                                ? 'bg-tertiary-container/10 text-tertiary'
                                : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {entry.status === 'completed' && (
                  <div className="hidden sm:flex items-center gap-xs text-outline-variant">
                    <MaterialIcon name="check_circle" className="text-[18px]" />
                    <span className="text-[12px]">Completed</span>
                  </div>
                )}
                {entry.actionLabel && (
                  <button
                    className={
                      entry.status === 'today'
                        ? 'bg-primary text-on-primary px-md py-sm rounded-lg font-label-sm shadow-md hover:scale-105 transition-transform'
                        : 'bg-surface-container px-md py-sm rounded-lg font-label-sm text-primary hover:bg-primary hover:text-on-primary transition-colors'
                    }
                  >
                    {entry.actionLabel}
                  </button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-lg">
          <GlassCard className="p-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-tertiary/5 space-y-md">
            <div className="flex items-center gap-sm">
              <MaterialIcon name="bolt" className="text-primary animate-bounce" />
              <h3 className="font-label-sm font-bold text-primary uppercase tracking-wider">AI Strategy Insight</h3>
            </div>
            <p className="font-body-md text-on-surface italic">"{aiInsight}"</p>
            <div className="pt-sm border-t border-white/40">
              <button className="w-full py-sm bg-primary/10 text-primary font-label-sm rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                Accept Recommendation
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-lg space-y-md">
            <h3 className="font-label-sm font-bold text-on-surface uppercase tracking-wider">Upcoming Milestones</h3>
            <ul className="space-y-md">
              {milestones.map((milestone) => (
                <li key={milestone.id} className="flex items-start gap-md">
                  <button
                    type="button"
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`w-5 h-5 border-2 rounded-md shrink-0 flex items-center justify-center mt-1 ${
                      milestone.done ? 'border-primary' : 'border-outline-variant'
                    }`}
                  >
                    {milestone.done && <MaterialIcon name="check" className="text-[14px] text-primary" />}
                  </button>
                  <div>
                    <p className="font-label-sm font-bold text-on-surface">{milestone.label}</p>
                    <p className="text-[12px] text-on-surface-variant">{milestone.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
            <MaterialIcon name="history" className="text-tertiary" />
            Spaced Repetition Calendar
          </h3>
          <p className="text-label-sm text-on-surface-variant">Visualizing retention cycles</p>
        </div>
        <GlassCard className="p-xl">
          <div className="grid grid-cols-7 gap-sm mb-md">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
              <div key={index} className="text-center font-label-sm text-outline-variant">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-sm">
            {calendar.map((cell, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center font-label-sm rounded-xl ${CALENDAR_VARIANT_CLASS[cell.variant]}`}
              >
                {cell.day}
              </div>
            ))}
          </div>
          <div className="mt-lg flex gap-lg text-[12px] justify-center">
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-primary rounded-sm" />
              <span>Focused Revision</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-tertiary rounded-sm" />
              <span>Spaced Recall</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-surface-container rounded-sm" />
              <span>No Session Scheduled</span>
            </div>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
