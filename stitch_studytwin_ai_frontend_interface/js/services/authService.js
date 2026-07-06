// Thin wrapper around Supabase Auth, used by the sign-in screen and by
// authGuard.js / the logout button on other screens.
(function () {
  function client() {
    if (!window.supabaseClient) throw new Error('Supabase client is not initialized — check script load order.');
    return window.supabaseClient;
  }

  async function signUp({ email, password, fullName }) {
    const { data, error } = await client().auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) throw error;
    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithOAuth(provider, redirectTo) {
    const { data, error } = await client().auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await client().auth.signOut();
    if (error) throw error;
  }

  async function getSession() {
    const { data, error } = await client().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  function onAuthStateChange(callback) {
    return client().auth.onAuthStateChange(callback);
  }

  window.authService = { signUp, signIn, signInWithOAuth, signOut, getSession, onAuthStateChange };
})();
