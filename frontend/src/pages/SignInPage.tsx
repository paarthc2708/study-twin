import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useParallax } from '../hooks/useParallax';
import { Modal } from '../components/ui/Modal';

type AuthMode = 'login' | 'signup';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SignInPage() {
  const { session, isConfigured, signIn, signUp, signInWithOAuth, resetPasswordForEmail, updatePassword, isPasswordRecovery, dismissPasswordRecovery } =
    useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const cardRef = useParallax<HTMLDivElement>();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isVisible, setIsVisible] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (forgotPasswordOpen) setForgotEmail(loginEmail);
  }, [forgotPasswordOpen, loginEmail]);

  if (session) return <Navigate to="/dashboard" replace />;

  function switchMode(next: AuthMode) {
    if (next === mode) return;
    setIsVisible(false);
    setTimeout(() => {
      setMode(next);
      setIsVisible(true);
    }, 300);
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!isConfigured) {
      navigate('/dashboard');
      return;
    }
    setIsLoggingIn(true);
    try {
      await signIn({ email: loginEmail, password: loginPassword });
      navigate('/dashboard');
    } catch (error) {
      showToast(errorMessage(error, 'Sign in failed.'));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    if (!isConfigured) {
      navigate('/dashboard');
      return;
    }
    setIsSigningUp(true);
    try {
      const { hasSession } = await signUp({ email: signupEmail, password: signupPassword, fullName: signupName });
      if (hasSession) {
        navigate('/dashboard');
      } else {
        showToast('Check your email to confirm your account, then sign in.', 'success');
        switchMode('login');
      }
    } catch (error) {
      showToast(errorMessage(error, 'Sign up failed.'));
    } finally {
      setIsSigningUp(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    if (!isConfigured) {
      showToast('Supabase is not configured yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
      return;
    }
    try {
      await signInWithOAuth(provider, `${window.location.origin}/dashboard`);
    } catch (error) {
      showToast(errorMessage(error, `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed.`));
    }
  }

  async function handleSendResetEmail(event: FormEvent) {
    event.preventDefault();
    setIsSendingReset(true);
    try {
      await resetPasswordForEmail(forgotEmail, `${window.location.origin}/sign-in`);
      showToast('Check your email for a password reset link.', 'success');
      setForgotPasswordOpen(false);
    } catch (error) {
      showToast(errorMessage(error, 'Could not send reset email.'));
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleUpdatePassword(event: FormEvent) {
    event.preventDefault();
    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      showToast('Password updated. Taking you to your dashboard.', 'success');
      setNewPassword('');
      navigate('/dashboard');
    } catch (error) {
      showToast(errorMessage(error, 'Could not update password.'));
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-md overflow-hidden font-body-md text-on-surface">
      <div
        className="fixed inset-0 -z-10 animate-[meshFlow_20s_ease_infinite_alternate]"
        style={{
          backgroundColor: '#faf8ff',
          backgroundImage:
            'radial-gradient(at 0% 0%, hsla(245, 60%, 85%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(255, 65%, 90%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(230, 70%, 85%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(245, 60%, 85%, 1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(260, 65%, 92%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(230, 70%, 85%, 1) 0, transparent 50%)',
          filter: 'blur(80px)',
        }}
      />

      <main className="w-full max-w-[440px] z-10">
        <div className="text-center mb-xl">
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">StudyTwin AI</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Your Cognitive Learning Partner</p>
        </div>

        <div ref={cardRef} className="glass-card rounded-xl p-lg md:p-xl flex flex-col gap-lg">
          <div className="flex bg-surface-container-low/50 p-unit rounded-lg">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-sm rounded-lg font-label-sm text-label-sm transition-all duration-300 ${
                mode === 'login' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/40'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-sm rounded-lg font-label-sm text-label-sm transition-all duration-300 ${
                mode === 'signup' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/40'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="flex flex-col gap-md">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-sm w-full py-md px-lg rounded-xl border border-white/40 bg-white/30 font-label-sm text-label-sm text-on-surface transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="flex items-center justify-center gap-sm w-full py-md px-lg rounded-xl border border-white/40 bg-white/30 font-label-sm text-label-sm text-on-surface transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05 1.61-3.14 1.61-1.04 0-1.78-.62-3.03-.62-1.28 0-2.18.61-3.09.61-1.12 0-2.26-.78-3.32-1.85C2.31 17.91 1 14.86 1 12.18c0-4.14 2.64-6.32 5.2-6.32 1.34 0 2.45.8 3.35.8.84 0 2.21-.86 3.73-.86 1.83 0 3.35.91 4.21 2.36-3.6 1.84-3 6.78.61 8.27-.66 1.76-1.57 3.25-2.05 3.85zM12.91 1c.04 2.12-1.68 4.09-3.71 4.09-.07-2.43 2.03-4.18 3.71-4.09z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-md">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="font-label-sm text-label-sm text-on-surface-variant/60">or</span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <div
            className={`relative min-h-[220px] transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
          >
            {mode === 'login' ? (
              <form className="flex flex-col gap-md" onSubmit={handleLogin}>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant px-unit" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/50 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex justify-between items-center px-unit">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="login-password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isConfigured) {
                          showToast('Supabase is not configured yet — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
                          return;
                        }
                        setForgotPasswordOpen(true);
                      }}
                      className="font-label-sm text-label-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/50 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-sm w-full py-md bg-primary text-on-primary rounded-xl font-label-sm text-label-sm font-semibold shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoggingIn ? 'Please wait…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-md" onSubmit={handleSignup}>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant px-unit" htmlFor="signup-name">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Alex Rivers"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/50 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant px-unit" htmlFor="signup-email">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/50 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant px-unit" htmlFor="signup-password">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/50 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="mt-sm w-full py-md bg-primary text-on-primary rounded-xl font-label-sm text-label-sm font-semibold shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSigningUp ? 'Please wait…' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-lg text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Need help? <a className="text-primary hover:underline" href="#">Contact Support</a>
          </p>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full py-lg px-xl flex flex-col md:flex-row justify-between items-center gap-md opacity-60">
        <span className="font-label-sm text-label-sm text-secondary">© 2024 StudyTwin AI. All rights reserved.</span>
        <div className="flex gap-lg">
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
        </div>
      </footer>

      <Modal open={forgotPasswordOpen} title="Reset your password" onClose={() => setForgotPasswordOpen(false)}>
        <form className="flex flex-col gap-md" onSubmit={handleSendResetEmail}>
          <p className="text-label-sm text-on-surface-variant">
            Enter your account email and we'll send you a password reset link.
          </p>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={forgotEmail}
            onChange={(event) => setForgotEmail(event.target.value)}
            className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
          />
          <button
            type="submit"
            disabled={isSendingReset}
            className="w-full py-md bg-primary text-on-primary rounded-xl font-label-sm text-label-sm font-semibold shadow-md disabled:opacity-50"
          >
            {isSendingReset ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </Modal>

      <Modal open={isPasswordRecovery} title="Set a new password" onClose={dismissPasswordRecovery}>
        <form className="flex flex-col gap-md" onSubmit={handleUpdatePassword}>
          <p className="text-label-sm text-on-surface-variant">Enter a new password (min. 6 characters).</p>
          <input
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full bg-surface-container-low/30 border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
          />
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full py-md bg-primary text-on-primary rounded-xl font-label-sm text-label-sm font-semibold shadow-md disabled:opacity-50"
          >
            {isUpdatingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
