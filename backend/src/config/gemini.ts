import { GoogleGenAI } from '@google/genai';
import { config } from './env';

// Server-side Gemini client. Holds the secret API key, so it must never be
// exposed to the frontend — the browser calls our /api/v1/ai/* routes, which
// call this client, never Gemini directly.
//
// `null` when Gemini hasn't been configured yet (GEMINI_API_KEY unset), so the
// server can still boot; consumers must check for null and fail the request,
// not the process.
export const gemini: GoogleGenAI | null = config.gemini.isConfigured
  ? new GoogleGenAI({ apiKey: config.gemini.apiKey })
  : null;

export const GEMINI_MODEL = 'gemini-2.5-flash';

if (!config.gemini.isConfigured) {
  // eslint-disable-next-line no-console
  console.warn('[gemini] GEMINI_API_KEY is not set — AI routes will respond with 500 until configured.');
}
