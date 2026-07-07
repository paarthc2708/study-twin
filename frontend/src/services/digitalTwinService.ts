import { supabase } from '../lib/supabaseClient';
import { generateInsight } from './aiService';
import type { CognitiveMetric, ConfidenceCalibration } from '../types/domain';

export interface CognitiveData {
  metrics: CognitiveMetric[];
  cognitiveLoadPercent: number;
  learningStyleKey: string;
}

export async function getSessionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('study_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}

export async function getCognitiveData(userId: string): Promise<CognitiveData | null> {
  const { data, error } = await supabase
    .from('cognitive_metrics')
    .select('learning_style, logic_score, memory_score, detail_score, speed_score, consistency_score, cognitive_load_percent')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.logic_score === null) return null;

  return {
    metrics: [
      { axis: 'Logic', value: data.logic_score ?? 0 },
      { axis: 'Memory', value: data.memory_score ?? 0 },
      { axis: 'Detail', value: data.detail_score ?? 0 },
      { axis: 'Speed', value: data.speed_score ?? 0 },
      { axis: 'Consistency', value: data.consistency_score ?? 0 },
    ],
    cognitiveLoadPercent: data.cognitive_load_percent ?? 0,
    learningStyleKey: data.learning_style ?? 'visual',
  };
}

const LEARNING_STYLE_INFO: Record<string, { title: string; description: string; tags: string[] }> = {
  visual: {
    title: 'Visual Learner',
    description: 'You process diagrams and spatial relationships faster than text-only documentation.',
    tags: ['Mind Maps', 'Flowcharts'],
  },
  auditory: {
    title: 'Auditory Learner',
    description: 'You retain concepts best when they are explained aloud or discussed.',
    tags: ['Discussions', 'Read Aloud'],
  },
  kinesthetic: {
    title: 'Kinesthetic Learner',
    description: 'You learn best through hands-on practice and active problem solving.',
    tags: ['Practice Problems', 'Simulations'],
  },
  reading_writing: {
    title: 'Reading/Writing Learner',
    description: 'You retain concepts best by reading and rewriting them in your own words.',
    tags: ['Note-Taking', 'Summaries'],
  },
};

export function getLearningStyleInfo(key: string) {
  return LEARNING_STYLE_INFO[key] ?? LEARNING_STYLE_INFO.visual;
}

export async function getConfidenceCalibration(userId: string): Promise<ConfidenceCalibration[]> {
  const { data, error } = await supabase
    .from('confidence_calibration')
    .select('id, confidence_percent, actual_percent, courses!inner(name)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as unknown as { id: string; confidence_percent: number; actual_percent: number; courses: { name: string } }[]).map(
    (row) => ({
      id: row.id,
      subject: row.courses.name,
      confidence: Math.round(row.confidence_percent),
      actual: Math.round(row.actual_percent),
    }),
  );
}

export function calibrationLabel(confidence: number, actual: number): string {
  const diff = confidence - actual;
  if (Math.abs(diff) <= 2) return 'Perfectly Aligned';
  return diff > 0 ? `Over-confident (+${diff}%)` : `Under-confident (${diff}%)`;
}

export function getCalibrationInsight(calibration: ConfidenceCalibration[]): string {
  if (calibration.length === 0) {
    return 'Complete a few quizzes across your courses to unlock your confidence calibration insight.';
  }
  const avgDiff = calibration.reduce((sum, c) => sum + (c.confidence - c.actual), 0) / calibration.length;
  if (avgDiff > 5) return "You tend to feel more confident than your quiz results support — try a 'Confidence Check' quiz before your next exam.";
  if (avgDiff < -5) return "You consistently outperform your own confidence estimates — trust your preparation more.";
  return 'Your confidence closely tracks your actual performance across subjects — well calibrated!';
}

export async function getInsights(
  userId: string,
  cognitiveData: CognitiveData | null,
  calibration: ConfidenceCalibration[],
): Promise<{ id: string; icon: string; body: string }[]> {
  if (!cognitiveData && calibration.length === 0) return [];

  const generated = await generateInsight('digital-twin', {
    cognitiveMetrics: cognitiveData?.metrics ?? null,
    learningStyle: cognitiveData?.learningStyleKey ?? null,
    confidenceCalibration: calibration,
  });

  const icons = ['lightbulb', 'history_edu'];
  return generated.map((insight, i) => ({ id: `${userId}-${i}`, icon: icons[i % icons.length], body: insight.body }));
}

export async function startFocusSession(userId: string): Promise<void> {
  const { error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, session_type: 'focus', started_at: new Date().toISOString() });
  if (error) throw error;
}
