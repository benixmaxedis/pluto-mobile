import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';

export default function RoutinesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary }}>
          Routines
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            minHeight: 120,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: fontSize.base, color: colors.text.muted }}>
            No routines yet. Build your rhythm here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
