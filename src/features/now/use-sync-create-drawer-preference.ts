import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '@/store/app-store';
import type { CreateDrawerPreferredOption } from '@/store/app-store';

/**
 * While Today or Now is focused, publish the expanded card's create-type hint for the global + drawer.
 */
export function useSyncCreateDrawerPreference(preferred: CreateDrawerPreferredOption | null) {
  const setPref = useAppStore((s) => s.setCreateDrawerPreferredOption);

  useFocusEffect(
    useCallback(() => {
      setPref(preferred);
      return () => setPref(null);
    }, [preferred, setPref]),
  );
}
