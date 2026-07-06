// Redirects to the Sign In screen if there is no active Supabase session.
// Include this only on authenticated app-shell screens (not the landing or
// sign-in screens themselves — that would loop).
//
// If Supabase hasn't been configured yet (.env is still blank), this skips
// enforcement and just warns, so the click-through prototype keeps working
// until real project credentials are in place. Once SUPABASE_URL and
// SUPABASE_ANON_KEY are set, this becomes a real, enforced auth gate.
(function () {
  if (!window.supabaseClient) {
    console.error('[authGuard] supabaseClient is not initialized — check script load order.');
    return;
  }

  if (!window.SUPABASE_IS_CONFIGURED) {
    console.warn('[authGuard] Supabase is not configured — skipping session check for this prototype screen.');
    return;
  }

  window.supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error || !data.session) {
      window.location.href = '/sign_in_to_studytwin_ai/code.html';
    }
  });
})();
