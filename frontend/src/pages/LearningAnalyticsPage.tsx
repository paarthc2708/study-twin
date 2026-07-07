import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { RingProgress } from '../components/charts/RingProgress';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { Heatmap } from '../components/charts/Heatmap';
import {
  getAiInsights,
  getHeatmapCells,
  getHeatmapMonthLabels,
  getMasteryPercent,
  getQuizScores,
  getStudyHours,
  getTopicMastery,
} from '../services/analyticsService';

type Range = 'week' | 'month';

export function LearningAnalyticsPage() {
  const [range, setRange] = useState<Range>('week');
  const [masteryPercent] = useState(() => getMasteryPercent());
  const [studyHours] = useState(() => getStudyHours());
  const [quizScores] = useState(() => getQuizScores());
  const [topicMastery] = useState(() => getTopicMastery());
  const [heatmapCells] = useState(() => getHeatmapCells());
  const [monthLabels] = useState(() => getHeatmapMonthLabels());
  const [insights] = useState(() => getAiInsights());

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <GlassCard className="md:col-span-4 p-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-tertiary/10 blur-[100px]" />
          <h3 className="font-label-sm text-on-surface-variant mb-md uppercase tracking-wider">Curriculum Mastery</h3>
          <RingProgress percent={masteryPercent} size={192} strokeWidth={12} trackClassName="text-surface-container-highest">
            <span className="font-display-lg text-display-lg text-primary">{masteryPercent}%</span>
            <span className="font-label-sm text-on-surface-variant">Complete</span>
          </RingProgress>
          <p className="mt-lg font-body-md text-on-surface-variant">
            You've mastered <span className="font-bold text-primary">42 of 56</span> core concepts this semester.
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-8 p-lg">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Study Hours per Week</h3>
              <p className="font-label-sm text-on-surface-variant">Tracking your focus time across the last 7 days</p>
            </div>
            <div className="flex gap-sm">
              <button
                onClick={() => setRange('week')}
                className={`px-md py-unit rounded-full font-label-sm border transition-all ${
                  range === 'week' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-surface-container text-on-surface-variant border-transparent'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-md py-unit rounded-full font-label-sm border transition-all ${
                  range === 'month' ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-surface-container text-on-surface-variant border-transparent'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <LineChart points={studyHours} />
        </GlassCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <GlassCard className="lg:col-span-7 p-lg">
          <h3 className="font-headline-md text-headline-md mb-lg">Quiz Scores by Subject</h3>
          <BarChart bars={quizScores} />
        </GlassCard>

        <div className="lg:col-span-5 flex flex-col gap-md">
          <h3 className="font-headline-md text-headline-md">Topic Mastery</h3>
          <div className="grid grid-cols-2 gap-md">
            {topicMastery.map((topic) => (
              <GlassCard key={topic.id} className="p-md flex flex-col gap-sm hover:translate-y-[-4px] transition-transform">
                <div className="flex justify-between items-center">
                  <span className={`px-sm py-xs rounded-full text-[10px] font-bold uppercase ${topic.categoryColorClass}`}>
                    {topic.category}
                  </span>
                  <span className="font-label-sm font-bold">{topic.percent}%</span>
                </div>
                <p className="font-body-md font-semibold">{topic.topic}</p>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full ${topic.colorClass}`} style={{ width: `${topic.percent}%` }} />
                </div>
              </GlassCard>
            ))}
          </div>
          <button className="w-full py-md border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all">
            View All Topics
          </button>
        </div>
      </section>

      <GlassCard className="p-lg">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h3 className="font-headline-md text-headline-md mb-xs">Learning Consistency</h3>
            <p className="font-label-sm text-on-surface-variant">Daily activity over the last 6 months</p>
          </div>
          <div className="flex items-center gap-sm font-label-sm text-on-surface-variant">
            <span>Less</span>
            <div className="w-3 h-3 bg-surface-container-highest rounded-[2px]" />
            <div className="w-3 h-3 bg-primary/20 rounded-[2px]" />
            <div className="w-3 h-3 bg-primary/50 rounded-[2px]" />
            <div className="w-3 h-3 bg-primary rounded-[2px]" />
            <span>More</span>
          </div>
        </div>
        <Heatmap cells={heatmapCells} monthLabels={monthLabels} />
      </GlassCard>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {insights.map((insight) => (
          <GlassCard key={insight.id} className="p-lg flex flex-col gap-md">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${insight.iconBgClass} ${insight.iconColorClass}`}>
              <MaterialIcon name={insight.icon} />
            </div>
            <h4 className="font-headline-md text-headline-md">{insight.title}</h4>
            <p className="font-body-md text-on-surface-variant">{insight.body}</p>
          </GlassCard>
        ))}
      </section>
    </>
  );
}
