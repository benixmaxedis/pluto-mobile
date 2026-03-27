import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import { resolveCurrentSession } from '../engine/session-resolver';
import { toISODate } from '@/lib/utils/date';

const SESSION_CHECK_INTERVAL = 60_000; // 1 minute

/**
 * Auto-detects session changes and refreshes app state.
 * Runs on a 60-second interval and on app foreground.
 * Triggers carry-forward and queue invalidation on session change.
 */
export function useSessionEngine() {
  const queryClient = useQueryClient();
  const { currentSession, setCurrentSession, setSelectedDate } = useAppStore();
  const prevSessionRef = useRef(currentSession);

  useEffect(() => {
    function checkSession() {
      const now = new Date();
      const newSession = resolveCurrentSession(now);
      const newDate = toISODate(now);

      if (newSession !== prevSessionRef.current) {
        prevSessionRef.current = newSession;
        setCurrentSession(newSession);
        setSelectedDate(newDate);

        // Invalidate queue to trigger re-evaluation
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['actions'] });
        queryClient.invalidateQueries({ queryKey: ['routine-instances'] });
      }
    }

    // Check immediately
    checkSession();

    // Check on interval
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Check on app foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkSession();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [queryClient, setCurrentSession, setSelectedDate]);
}
