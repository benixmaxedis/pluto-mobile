import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { clearDeviceUserId } from '@/lib/supabase/auth';
import { queryClient } from '@/lib/query-client';

export function useAuth() {
  const { setUnauthenticated } = useAuthStore();

  const signOut = useCallback(async () => {
    await clearDeviceUserId();
    queryClient.clear();
    setUnauthenticated();
  }, [setUnauthenticated]);

  return { signOut };
}
