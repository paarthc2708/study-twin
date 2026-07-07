import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../utils/AppError';

export function getMe(req: Request, res: Response): void {
  // requireAuth guarantees req.user is set before this handler runs.
  res.status(200).json({ user: req.user });
}

export async function deleteMe(req: Request, res: Response): Promise<void> {
  // requireAuth guarantees req.user is set before this handler runs. Deleting
  // the auth.users row requires the service-role client (the anon key can't
  // delete other users' — or its own — auth record); every other table
  // cascades from it via ON DELETE CASCADE in the schema, so this one call
  // removes all of the user's data.
  if (!supabaseAdmin) {
    throw new AppError('Supabase is not configured on the server (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)', 500);
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user!.id);
  if (error) throw new AppError(`Failed to delete account: ${error.message}`, 500);
  res.status(204).send();
}
