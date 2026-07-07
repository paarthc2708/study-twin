import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

type NodeEnv = 'development' | 'production' | 'test';

interface Config {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  port: number;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    isConfigured: boolean;
  };
  gemini: {
    apiKey: string;
    isConfigured: boolean;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Unlike requireEnv, this never throws — Supabase-dependent routes are
// optional at boot and fail with a clear 500 at request time instead (see
// config/supabase.ts), so the server can still start before it's configured.
function optionalEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
  }
  return parsed;
}

const nodeEnv = (process.env.NODE_ENV ?? 'development') as NodeEnv;

const supabaseUrl = optionalEnv('SUPABASE_URL');
const supabaseServiceRoleKey = optionalEnv('SUPABASE_SERVICE_ROLE_KEY');
const geminiApiKey = optionalEnv('GEMINI_API_KEY');

export const config: Config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parseIntEnv('PORT', 4000),
  corsOrigins: requireEnv('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    maxRequests: parseIntEnv('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  supabase: {
    url: supabaseUrl,
    anonKey: optionalEnv('SUPABASE_ANON_KEY'),
    serviceRoleKey: supabaseServiceRoleKey,
    isConfigured: Boolean(supabaseUrl && supabaseServiceRoleKey),
  },
  gemini: {
    apiKey: geminiApiKey,
    isConfigured: Boolean(geminiApiKey),
  },
};
