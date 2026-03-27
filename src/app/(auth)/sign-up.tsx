import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';

export default function SignUpScreen() {
  const router = useRouter();

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
          Create Account
        </Text>
        <Text style={{ fontSize: fontSize.base, color: colors.text.secondary, textAlign: 'center' }}>
          Join Pluto and start building momentum.
        </Text>

        <Pressable
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
            Sign Up
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
