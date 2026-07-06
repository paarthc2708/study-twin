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

  // Step 1 of the Forgot Password flow: emails the user a recovery link that
  // redirects back to redirectTo with a recovery session in the URL.
  async function resetPasswordForEmail(email, redirectTo) {
    const { error } = await client().auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
    if (error) throw error;
  }

  // Step 2: called once the recovery session from the email link is active
  // (see authGuard.js / the PASSWORD_RECOVERY auth event) to set a new password.
  async function updatePassword(newPassword) {
    const { data, error } = await client().auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  }

  window.authService = {
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    getSession,
    onAuthStateChange,
    resetPasswordForEmail,
    updatePassword,
  };
})();
