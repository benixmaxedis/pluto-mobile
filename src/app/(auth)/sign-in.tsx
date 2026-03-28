import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';
import { getSupabase } from '@/lib/supabase/client';
import { getOrCreateDeviceUserId } from '@/lib/identity/device-user-id';
import { useAuthStore } from '@/store/auth-store';

/**
 * Shown when Supabase env is missing or after sign-out. Pluto uses a per-device id, not accounts.
 */
export default function SignInScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      getSupabase();
      const userId = await getOrCreateDeviceUserId();
      setAuthenticated(userId);
      router.replace('/(app)/now');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: spacing['2xl'],
          gap: spacing.lg,
        }}
      >
        <Text style={{ fontSize: fontSize['3xl'], fontWeight: '700', color: colors.text.primary }}>
          Pluto
        </Text>
        <Text style={{ fontSize: fontSize.base, color: colors.text.secondary, textAlign: 'center' }}>
          Your momentum, gently guided. Data is tied to this device.
        </Text>
        {error ? (
          <Text style={{ fontSize: fontSize.sm, color: colors.error }}>{error}</Text>
        ) : null}

        <Pressable
          onPress={() => void handleContinue()}
          disabled={loading}
          style={{
            backgroundColor: colors.actions.primary,
            paddingHorizontal: spacing['2xl'],
            paddingVertical: spacing.lg,
            borderRadius: 14,
            marginTop: spacing.md,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.background }}>
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
