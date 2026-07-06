// Shared Supabase client for all StudyTwin AI frontend screens. Loaded via a
// plain <script> tag (no bundler), so it hangs its export off `window`.
//
// Load order on each page: /env.js -> @supabase/supabase-js (CDN) -> this
// file -> authService.js / authGuard.js.
(function () {
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[supabaseClient] @supabase/supabase-js failed to load — check the CDN <script> tag on this page.');
    return;
  }

  const env = window.__ENV__ || {};
  window.SUPABASE_IS_CONFIGURED = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);

  if (!window.SUPABASE_IS_CONFIGURED) {
    console.warn('[supabaseClient] SUPABASE_URL / SUPABASE_ANON_KEY are not set in .env — auth calls will fail until they are.');
  }

  window.supabaseClient = window.supabase.createClient(
    env.SUPABASE_URL || 'https://placeholder.supabase.co',
    env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
})();
