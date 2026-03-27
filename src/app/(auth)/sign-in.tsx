import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';
import { useAuthStore } from '@/store/auth-store';

export default function SignInScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();

  const handleSignIn = () => {
    // TODO: Implement real auth
    setAuthenticated('local-user');
    router.replace('/(app)/now');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing['2xl'],
          gap: spacing.xl,
        }}
      >
        <Text style={{ fontSize: fontSize['3xl'], fontWeight: '700', color: colors.text.primary }}>
          Pluto
        </Text>
        <Text style={{ fontSize: fontSize.base, color: colors.text.secondary, textAlign: 'center' }}>
          Your momentum, gently guided.
        </Text>

        <Pressable
          onPress={handleSignIn}
          style={{
            backgroundColor: colors.actions.primary,
            paddingHorizontal: spacing['2xl'],
            paddingVertical: spacing.lg,
            borderRadius: 14,
            marginTop: spacing.xl,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.background }}>
            Sign In
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
            Don&apos;t have an account? Sign up
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
