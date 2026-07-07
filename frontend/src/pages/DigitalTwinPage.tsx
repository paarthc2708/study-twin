import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { RadarChart } from '../components/charts/RadarChart';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import {
  calibrationLabel,
  getCalibrationInsight,
  getCognitiveData,
  getConfidenceCalibration,
  getInsights,
  getLearningStyleInfo,
  getSessionCount,
  startFocusSession,
} from '../services/digitalTwinService';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function DigitalTwinPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadAll = useCallback(async () => {
    const userId = user!.id;
    const [sessionCount, cognitiveData, calibration] = await Promise.all([
      getSessionCount(userId),
      getCognitiveData(userId),
      getConfidenceCalibration(userId),
    ]);
    const insights = await getInsights(userId, cognitiveData, calibration);
    return { sessionCount, cognitiveData, calibration, insights };
  }, [user]);

  const { data, loading, error, refetch } = useSupabaseQuery(loadAll, [user?.id]);

  async function handleStartFocusSession() {
    if (!user) return;
    try {
      await startFocusSession(user.id);
      showToast('Focus session started!', 'success');
    } catch (err) {
      showToast(errorMessage(err, 'Could not start session.'));
    }
  }

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-lg py-xl w-full">
        <p className="text-on-surface-variant">Loading your digital twin…</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="max-w-container-max mx-auto px-lg py-xl w-full text-center space-y-md">
        <p className="text-error">{error}</p>
        <button onClick={refetch} className="text-primary font-bold hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const { sessionCount, cognitiveData, calibration, insights } = data;
  const learningStyle = cognitiveData ? getLearningStyleInfo(cognitiveData.learningStyleKey) : null;
  const calibrationInsight = getCalibrationInsight(calibration);

  return (
    <div className="max-w-container-max mx-auto px-lg py-xl w-full space-y-2xl">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Your Digital Twin</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            A behavioral and cognitive mirror synthesized from {sessionCount} study session{sessionCount === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-primary uppercase tracking-widest">Twin Status</span>
            <span className="font-body-md font-bold text-on-surface">{cognitiveData ? 'Synchronized' : 'Learning You'}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container ai-active-glow">
            <MaterialIcon name="bolt" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-gutter">
        <GlassCard className="col-span-12 lg:col-span-8 rounded-3xl p-xl flex flex-col relative overflow-hidden h-[500px]">
          <div className="relative z-10">
            <div className="inline-flex items-center px-md py-xs bg-primary/10 text-primary rounded-full mb-md border border-primary/20">
              <MaterialIcon name="query_stats" className="text-[18px] mr-unit" />
              <span className="font-label-sm">Cognitive Load: {cognitiveData?.cognitiveLoadPercent ?? '—'}%</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Neural Synthesis</h3>
            <p className="font-body-md text-on-surface-variant max-w-xs">
              Your twin analyzes your recent study patterns to help you plan focused sessions.
            </p>
          </div>
          <div className="mt-auto relative z-10 flex gap-md">
            <button
              onClick={handleStartFocusSession}
              className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-sm flex items-center gap-sm hover:opacity-90 transition-opacity"
            >
              Start Focus Session
              <MaterialIcon name="play_arrow" className="text-[18px]" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="glass-card px-lg py-md rounded-xl font-label-sm text-on-surface hover:bg-white/40 transition-colors"
            >
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
            {learningStyle ? (
              <>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-unit">{learningStyle.title}</h4>
                <p className="font-body-md text-on-surface-variant">{learningStyle.description}</p>
                <div className="mt-md flex flex-wrap gap-xs">
                  {learningStyle.tags.map((tag) => (
                    <span key={tag} className="px-sm py-unit bg-tertiary/10 text-tertiary rounded-lg font-label-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="font-body-md text-on-surface-variant">Complete a few study sessions to discover your learning style.</p>
            )}
          </GlassCard>

          <GlassCard className="rounded-3xl p-lg flex-1">
            <h4 className="font-label-sm text-primary font-bold uppercase tracking-wider mb-md">AI Insights</h4>
            <div className="space-y-md">
              {insights.length === 0 && <p className="text-on-surface-variant text-label-sm">Not enough data yet for AI insights.</p>}
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
          {cognitiveData ? (
            <RadarChart axes={cognitiveData.metrics} />
          ) : (
            <p className="text-center text-on-surface-variant py-xl">
              Complete a few study sessions and quizzes to unlock your Cognitive Radar.
            </p>
          )}
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
          {calibration.length === 0 ? (
            <p className="text-center text-on-surface-variant py-xl">No calibration data yet — complete quizzes across a few courses.</p>
          ) : (
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
          )}
          <div className="mt-xl p-md bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-body-md text-primary italic">"{calibrationInsight}"</p>
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
