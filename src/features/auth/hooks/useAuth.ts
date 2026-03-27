import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import * as authService from '../auth-service';
import { generateId } from '@/lib/utils/id';

export function useAuth() {
  const { setAuthenticated, setUnauthenticated, setLoading } = useAuthStore();

  /**
   * Sign in with email/password.
   * For v1 this generates a local token — real API auth is a placeholder.
   */
  const signIn = useCallback(
    async (email: string, _password: string) => {
      setLoading(true);
      try {
        // TODO: call backend POST /auth/sign-in
        const userId = generateId();
        const fakeToken = `local_${userId}`;
        await authService.storeTokens(fakeToken);
        setAuthenticated(userId);
      } catch (error) {
        setUnauthenticated();
        throw error;
      }
    },
    [setAuthenticated, setUnauthenticated, setLoading],
  );

  /**
   * Create a new account.
   * For v1 this generates a local token — real API auth is a placeholder.
   */
  const signUp = useCallback(
    async (email: string, _password: string) => {
      setLoading(true);
      try {
        // TODO: call backend POST /auth/sign-up
        const userId = generateId();
        const fakeToken = `local_${userId}`;
        await authService.storeTokens(fakeToken);
        setAuthenticated(userId);
      } catch (error) {
        setUnauthenticated();
        throw error;
      }
    },
    [setAuthenticated, setUnauthenticated, setLoading],
  );

  /**
   * Sign out: clear tokens and reset auth state.
   */
  const signOut = useCallback(async () => {
    await authService.clearTokens();
    setUnauthenticated();
  }, [setUnauthenticated]);

  /**
   * Restore a previous session on app launch.
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.restoreAuth();
      if (result) {
        setAuthenticated(result.userId);
      } else {
        setUnauthenticated();
      }
    } catch {
      setUnauthenticated();
    }
  }, [setAuthenticated, setUnauthenticated, setLoading]);

  return { signIn, signUp, signOut, restoreSession };
}
