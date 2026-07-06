import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

// Server-side admin client, authenticated with the service role key. This
// bypasses Row Level Security, so it must never be exposed to the frontend —
// use it only inside backend code (e.g. verifying user tokens, privileged
// queries).
//
// `null` when Supabase hasn't been configured yet (SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY unset), so the server can still boot; consumers
// must check for null and fail the request, not the process.
export const supabaseAdmin: SupabaseClient | null = config.supabase.isConfigured
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

if (!config.supabase.isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — Supabase-dependent routes will respond with 500 until configured.'
  );
}
