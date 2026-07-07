import { Request, Response } from 'express';
import { Schema, Type } from '@google/genai';
import { GEMINI_MODEL, gemini } from '../config/gemini';
import { AppError } from '../utils/AppError';

function requireGemini(): NonNullable<typeof gemini> {
  if (!gemini) {
    throw new AppError('Gemini is not configured on the server (set GEMINI_API_KEY)', 500);
  }
  return gemini;
}

async function generateJson<T>(prompt: string, schema: Schema, systemInstruction: string): Promise<T> {
  const response = await requireGemini().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });
  const text = response.text;
  if (!text) throw new AppError('Gemini returned an empty response', 502);
  return JSON.parse(text) as T;
}

interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function postMentorReply(req: Request, res: Response): Promise<void> {
  const { message, history } = req.body as { message?: string; history?: ChatHistoryEntry[] };
  if (!message || typeof message !== 'string') {
    throw new AppError('"message" is required', 400);
  }

  const contents = [
    ...(Array.isArray(history) ? history : []).map((entry) => ({
      role: entry.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: entry.content }],
    })),
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  const response = await requireGemini().models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction:
        'You are StudyTwin AI, a friendly and encouraging AI study mentor helping a student. ' +
        'Keep replies focused and practical — 2 to 4 sentences unless the student asks for more detail.',
    },
  });

  const reply = response.text;
  if (!reply) throw new AppError('Gemini returned an empty response', 502);
  res.status(200).json({ reply });
}

interface QuizQuestionOut {
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
}

const quizQuestionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ['label', 'text'],
            },
          },
          correctOption: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['questionText', 'options', 'correctOption', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

export async function postQuizQuestions(req: Request, res: Response): Promise<void> {
  const { topic, difficulty, count } = req.body as { topic?: string; difficulty?: string; count?: number };
  if (!topic || typeof topic !== 'string') throw new AppError('"topic" is required', 400);
  const questionCount = Number.isInteger(count) && count! > 0 ? count! : 5;

  const { questions } = await generateJson<{ questions: QuizQuestionOut[] }>(
    `Generate exactly ${questionCount} multiple-choice quiz questions about "${topic}" at ${difficulty ?? 'adaptive_ai'} difficulty. ` +
      'Each question must have exactly 4 options labeled "A", "B", "C", "D". "correctOption" must match one of the option labels exactly. ' +
      'Include a short explanation of why the correct answer is correct.',
    quizQuestionsSchema,
    'You are an expert quiz author for a student study app. Return only well-formed, factually correct questions.',
  );

  res.status(200).json({ questions });
}

const quizFeedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    feedback: { type: Type.STRING },
    weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['feedback', 'weakTopics'],
};

export async function postQuizFeedback(req: Request, res: Response): Promise<void> {
  const { topic, questions, answers, score, total } = req.body as {
    topic?: string;
    questions?: { questionText: string; correctOption: string }[];
    answers?: (string | null)[];
    score?: number;
    total?: number;
  };
  if (!topic || !Array.isArray(questions) || !Array.isArray(answers)) {
    throw new AppError('"topic", "questions", and "answers" are required', 400);
  }

  const missed = questions
    .map((q, i) => ({ ...q, given: answers[i] ?? null }))
    .filter((q) => q.given !== q.correctOption);

  const { feedback, weakTopics } = await generateJson<{ feedback: string; weakTopics: string[] }>(
    `A student just finished a quiz on "${topic}", scoring ${score ?? 0}/${total ?? questions.length}. ` +
      `Missed questions: ${JSON.stringify(missed.map((q) => q.questionText))}. ` +
      'Write 2-3 sentences of encouraging, specific feedback as their AI study mentor, then list any weak sub-topics ' +
      '(empty array if the score was perfect).',
    quizFeedbackSchema,
    'You are an encouraging but honest AI study mentor giving quiz feedback.',
  );

  res.status(200).json({ feedback, weakTopics });
}

const insightSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          body: { type: Type.STRING },
        },
        required: ['title', 'body'],
      },
    },
  },
  required: ['insights'],
};

const INSIGHT_PROMPTS: Record<string, string> = {
  strategy: 'Suggest one focused study-strategy recommendation for the coming week, based on this study data.',
  analytics: 'Identify 1-3 insights about study habits and performance trends from this data.',
  'digital-twin': 'Identify 1-2 insights about this student\'s learning style and cognitive patterns from this data.',
};

export async function postInsight(req: Request, res: Response): Promise<void> {
  const { kind, context } = req.body as { kind?: string; context?: Record<string, unknown> };
  if (!kind || !INSIGHT_PROMPTS[kind]) throw new AppError('"kind" must be one of strategy, analytics, digital-twin', 400);

  const { insights } = await generateJson<{ insights: { title: string; body: string }[] }>(
    `${INSIGHT_PROMPTS[kind]}\n\nStudent data: ${JSON.stringify(context ?? {})}`,
    insightSchema,
    'You are an AI study mentor generating short, specific, encouraging insights from a student\'s real study data. Never invent data not present in the input.',
  );

  res.status(200).json({ insights });
}
