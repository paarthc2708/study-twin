import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { RadarChart } from '../components/charts/RadarChart';
import {
  calibrationLabel,
  getCognitiveMetrics,
  getConfidenceCalibration,
  getInsights,
  getLearningStyle,
} from '../services/digitalTwinService';

export function DigitalTwinPage() {
  const [cognitiveMetrics] = useState(() => getCognitiveMetrics());
  const [calibration] = useState(() => getConfidenceCalibration());
  const [learningStyle] = useState(() => getLearningStyle());
  const [insights] = useState(() => getInsights());

  return (
    <div className="max-w-container-max mx-auto px-lg py-xl w-full space-y-2xl">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Alex's Digital Twin</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            A real-time behavioral and cognitive mirror synthesized from over 450 study sessions and 12,000 data points.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-primary uppercase tracking-widest">Twin Status</span>
            <span className="font-body-md font-bold text-on-surface">Synchronized</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container ai-active-glow">
            <MaterialIcon name="bolt" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-gutter">
        <GlassCard className="col-span-12 lg:col-span-8 rounded-3xl p-xl flex flex-col relative overflow-hidden h-[500px]">
          <div
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA7gL7TusYDyycWkcoff-tV9NK8v1N_evWIiT7t-hg5r7CRcK5x8R-p88OmZdI_S4eEWVXq6XuRFl5C2D1P57bINFW5h671j81sLQJfRo2O0M__aAHD2IiQ6s7sod1uP-IVlcNd0Hk1xllsiiIrTa0Bjj-08mfp6EuLjdOGMD1oAEccBB1ULlX2w2Je9albEAWH3_YdojsHIhWcPmXu7e-l4qrqfsFliTViLOA0UEnqx-8DTx62fEqMtQqPluJsjgnozUMneHRvmw')",
            }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center px-md py-xs bg-primary/10 text-primary rounded-full mb-md border border-primary/20">
              <MaterialIcon name="query_stats" className="text-[18px] mr-unit" />
              <span className="font-label-sm">Cognitive Load: 42%</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Neural Synthesis</h3>
            <p className="font-body-md text-on-surface-variant max-w-xs">
              Your twin is currently predicting peak focus for the next 45 minutes based on your circadian rhythm.
            </p>
          </div>
          <div className="mt-auto relative z-10 flex gap-md">
            <button className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-sm flex items-center gap-sm hover:opacity-90 transition-opacity">
              Start Focus Session
              <MaterialIcon name="play_arrow" className="text-[18px]" />
            </button>
            <button className="glass-card px-lg py-md rounded-xl font-label-sm text-on-surface hover:bg-white/40 transition-colors">
              Twin Settings
            </button>
          </div>
        </GlassCard>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          <GlassCard className="rounded-3xl p-lg border-l-4 border-tertiary">
            <div className="flex items-center justify-between mb-md">
              <span className="font-label-sm text-tertiary font-bold uppercase tracking-wider">Primary Style</span>
              <MaterialIcon name="visibility" className="text-tertiary" />
            </div>
            <h4 className="font-headline-md text-headline-md text-on-surface mb-unit">{learningStyle.title}</h4>
            <p className="font-body-md text-on-surface-variant">{learningStyle.description}</p>
            <div className="mt-md flex flex-wrap gap-xs">
              {learningStyle.tags.map((tag) => (
                <span key={tag} className="px-sm py-unit bg-tertiary/10 text-tertiary rounded-lg font-label-sm">
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="rounded-3xl p-lg flex-1">
            <h4 className="font-label-sm text-primary font-bold uppercase tracking-wider mb-md">AI Insights</h4>
            <div className="space-y-md">
              {insights.map((insight) => (
                <div key={insight.id} className="flex gap-md p-md bg-surface-container rounded-2xl">
                  <MaterialIcon name={insight.icon} className="text-primary" />
                  <p className="font-body-md text-on-surface">{insight.body}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="col-span-12 lg:col-span-5 rounded-3xl p-xl">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-xl text-center">Cognitive Radar</h4>
          <RadarChart axes={cognitiveMetrics} />
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-7 rounded-3xl p-xl">
          <div className="flex justify-between items-center mb-xl">
            <h4 className="font-headline-md text-headline-md text-on-surface">Subject Calibration</h4>
            <div className="flex gap-md">
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[12px] font-label-sm">Actual</span>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-surface-variant" />
                <span className="text-[12px] font-label-sm">Confidence</span>
              </div>
            </div>
          </div>
          <div className="space-y-xl">
            {calibration.map((entry) => (
              <div key={entry.id} className="space-y-sm">
                <div className="flex justify-between font-label-sm">
                  <span className="text-on-surface font-bold">{entry.subject}</span>
                  <span className="text-on-surface-variant">{calibrationLabel(entry.confidence, entry.actual)}</span>
                </div>
                <div className="relative h-6 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-surface-variant rounded-full" style={{ width: `${entry.confidence}%` }} />
                  <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${entry.actual}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-xl p-md bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-body-md text-primary italic">
              "Alex, you tend to underestimate your progress in humanities subjects while overestimating math results. Try
              the 'Confidence Check' quiz before your next calculus exam."
            </p>
          </div>
        </GlassCard>
      </div>

      <footer className="py-xl border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md font-bold text-primary">StudyTwin AI</span>
          <p className="font-label-sm text-secondary">© 2024 StudyTwin AI. All rights reserved.</p>
        </div>
        <div className="flex gap-lg">
          <a className="font-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="font-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
}
