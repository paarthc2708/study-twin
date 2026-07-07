import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
}

interface SignInParams {
  email: string;
  password: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  /** True once the recovery-link auth event fires; drives the "set a new password" modal. */
  isPasswordRecovery: boolean;
  signUp: (params: SignUpParams) => Promise<{ hasSession: boolean }>;
  signIn: (params: SignInParams) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple', redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  dismissPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) throw error;
    return { hasSession: Boolean(data.session) };
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInParams) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple', redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined,
    );
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  }, []);

  const dismissPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      isPasswordRecovery,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      dismissPasswordRecovery,
    }),
    [
      session,
      isLoading,
      isPasswordRecovery,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      dismissPasswordRecovery,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
