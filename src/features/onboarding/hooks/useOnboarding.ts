import { useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function useOnboarding() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  /**
   * Mark onboarding as completed.
   */
  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
  }, [setOnboarded]);

  return { isOnboarded, completeOnboarding };
}
