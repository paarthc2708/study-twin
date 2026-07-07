import type { CognitiveMetric, ConfidenceCalibration } from '../types/domain';

// Mock data shaped after the `cognitive_metrics` / `confidence_calibration`
// Supabase tables.
export function getCognitiveMetrics(): CognitiveMetric[] {
  return [
    { axis: 'Logic', value: 90 },
    { axis: 'Memory', value: 75 },
    { axis: 'Detail', value: 60 },
    { axis: 'Speed', value: 82 },
    { axis: 'Consistency', value: 88 },
  ];
}

export function getConfidenceCalibration(): ConfidenceCalibration[] {
  return [
    { id: 'c1', subject: 'Calculus II', confidence: 92, actual: 80 },
    { id: 'c2', subject: 'Discrete Mathematics', confidence: 85, actual: 85 },
    { id: 'c3', subject: 'Cognitive Psychology', confidence: 65, actual: 73 },
  ];
}

export function calibrationLabel(confidence: number, actual: number): string {
  const diff = confidence - actual;
  if (Math.abs(diff) <= 2) return 'Perfectly Aligned';
  return diff > 0 ? `Over-confident (+${diff}%)` : `Under-confident (${diff}%)`;
}

export function getLearningStyle() {
  return {
    title: 'Visual Learner',
    description: 'You process diagrams and spatial relationships 45% faster than text-only documentation.',
    tags: ['Mind Maps', 'Flowcharts'],
  };
}

export function getInsights() {
  return [
    {
      id: 'i1',
      icon: 'lightbulb',
      body: "Alex performs 20% better in morning sessions before 10 AM.",
    },
    {
      id: 'i2',
      icon: 'history_edu',
      body: 'Focus on active recall for History; passive reading is failing retention.',
    },
  ];
}
