import { apiClient } from '../lib/apiClient';

// Thin wrapper around the backend's Gemini-backed /ai/* routes. The Gemini API
// key is a server-side secret — the frontend never talks to Gemini directly.

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function getMentorReply(message: string, history: ChatHistoryEntry[]): Promise<string> {
  const { data } = await apiClient.post<{ reply: string }>('/ai/mentor-reply', { message, history });
  return data.reply;
}

export interface GeneratedQuizQuestion {
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
}

export async function generateQuizQuestions(
  topic: string,
  difficulty: string,
  count: number,
): Promise<GeneratedQuizQuestion[]> {
  const { data } = await apiClient.post<{ questions: GeneratedQuizQuestion[] }>('/ai/quiz-questions', {
    topic,
    difficulty,
    count,
  });
  return data.questions;
}

export async function generateQuizFeedback(params: {
  topic: string;
  questions: { questionText: string; correctOption: string }[];
  answers: (string | null)[];
  score: number;
  total: number;
}): Promise<{ feedback: string; weakTopics: string[] }> {
  const { data } = await apiClient.post<{ feedback: string; weakTopics: string[] }>('/ai/quiz-feedback', params);
  return data;
}

export type InsightKind = 'strategy' | 'analytics' | 'digital-twin';

export interface GeneratedInsight {
  title: string;
  body: string;
}

export async function generateInsight(kind: InsightKind, context: Record<string, unknown>): Promise<GeneratedInsight[]> {
  const { data } = await apiClient.post<{ insights: GeneratedInsight[] }>('/ai/insight', { kind, context });
  return data.insights;
}
