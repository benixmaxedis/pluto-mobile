import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/auth-store';
import { getSupabase } from '@/lib/supabase/client';
import { getOrCreateDeviceUserId } from '@/lib/identity/device-user-id';
import { queryClient } from '@/lib/query-client';
import { useAppFonts } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setNavigationReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/now');
    }
  }, [isAuthenticated, isLoading, isNavigationReady, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        getSupabase();
        const userId = await getOrCreateDeviceUserId();
        useAuthStore.getState().setAuthenticated(userId);
      } catch {
        useAuthStore.getState().setUnauthenticated();
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [authReady, fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <Slot />
          </AuthGate>
          <StatusBar style="light" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
