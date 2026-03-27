import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';
import { useAppStore } from '@/store/app-store';
import { formatDisplayDate } from '@/lib/utils/date';
import { getSessionLabel } from '@/lib/constants/sessions';

export default function NowScreen() {
  const { selectedDate, currentSession } = useAppStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
            {formatDisplayDate(selectedDate)} &middot; {getSessionLabel(currentSession)}
          </Text>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary }}>
            Now
          </Text>
        </View>

        {/* Focus card placeholder */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 160,
          }}
        >
          <Text style={{ fontSize: fontSize.base, color: colors.text.muted }}>
            Nothing right now. You&apos;re all caught up.
          </Text>
        </View>

        {/* Queue preview placeholder */}
        <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '600' }}>
          Up Next
        </Text>
      </View>
    </SafeAreaView>
  );
}
