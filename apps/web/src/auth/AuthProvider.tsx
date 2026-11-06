import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authClient, getAuthAccessToken } from './auth-client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export type AuthStatus =
  | 'unconfigured'
  | 'loading'
  | 'anonymous'
  | 'authenticated'
  | 'error';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  isConfigured: boolean;
  signInWithGoogle: (callbackURL: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function messageFrom(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    authClient ? 'loading' : 'unconfigured',
  );
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!authClient) return { user: null, error: null };
    setStatus('loading');
    try {
      const result = await authClient.getSession();
      if (result.error) throw new Error(result.error.message);
      const sessionUser = result.data?.user;
      const currentUser = sessionUser
        ? {
            id: sessionUser.id,
            name: sessionUser.name,
            email: sessionUser.email,
            image: sessionUser.image ?? null,
          }
        : null;
      if (currentUser) {
        setUser(currentUser);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('anonymous');
      }
      setError(null);
      return { user: currentUser, error: null };
    } catch (reason) {
      setUser(null);
      setStatus('error');
      const message = messageFrom(reason, 'Não foi possível verificar sua sessão.');
      setError(message);
      return { user: null, error: message };
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signInWithGoogle = useCallback(async (callbackURL: string) => {
    if (!authClient) throw new Error('O login não está configurado neste ambiente.');
    setError(null);
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      });
      if (result.error) throw new Error(result.error.message);
    } catch (reason) {
      const message = messageFrom(reason, 'Não foi possível iniciar o login com Google.');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!authClient) throw new Error('O login não está configurado neste ambiente.');
    setError(null);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message);
      const session = await refreshSession();
      if (session.error) throw new Error(session.error);
      if (!session.user) throw new Error('Não foi possível iniciar sua sessão.');
    } catch (reason) {
      const message = messageFrom(reason, 'Não foi possível entrar com este e-mail.');
      setError(message);
      throw new Error(message);
    }
  }, [refreshSession]);

  const signUpWithEmail = useCallback(async (
    name: string,
    email: string,
    password: string,
  ) => {
    if (!authClient) throw new Error('O cadastro não está configurado neste ambiente.');
    setError(null);
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) throw new Error(result.error.message);
      const session = await refreshSession();
      if (session.error) throw new Error(session.error);
      return session.user !== null;
    } catch (reason) {
      const message = messageFrom(reason, 'Não foi possível criar sua conta.');
      setError(message);
      throw new Error(message);
    }
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    if (!authClient) return;
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
      setUser(null);
      setStatus('anonymous');
    } catch (reason) {
      setError(messageFrom(reason, 'Não foi possível encerrar sua sessão.'));
    }
  }, []);

  const getAccessToken = useCallback(async () => {
    return getAuthAccessToken();
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isConfigured: authClient !== null,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      getAccessToken,
    }),
    [user, status, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
