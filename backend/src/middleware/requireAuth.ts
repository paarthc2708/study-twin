import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) {
    throw new AppError('Missing or malformed Authorization header (expected "Bearer <token>")', 401);
  }

  if (!supabaseAdmin) {
    throw new AppError('Supabase is not configured on the server (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)', 500);
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new AppError('Invalid or expired session token', 401);
  }

  req.user = data.user;
  next();
});
