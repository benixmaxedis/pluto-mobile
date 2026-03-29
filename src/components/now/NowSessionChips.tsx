import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Session } from '@/lib/constants';
import { colors, spacing, fontSize, borderRadius, fontFamily } from '@/lib/theme';
import type { NowSessionFilter } from '@/features/now/use-now-queues';

const BUTTONS: { key: NowSessionFilter; icon: string }[] = [
  { key: Session.MORNING,   icon: 'sunny-outline' },
  { key: Session.AFTERNOON, icon: 'partly-sunny-outline' },
  { key: Session.EVENING,   icon: 'moon-outline' },
  { key: 'all',             icon: 'grid-outline' },
];

type Props = {
  value: NowSessionFilter;
  onChange: (v: NowSessionFilter) => void;
  completedCount: number;
  totalCount: number;
};

export function NowSessionChips({ value, onChange, completedCount, totalCount }: Props) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
        gap: spacing.md,
      }}
    >
      {/* Icon filter buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {BUTTONS.map(({ key, icon }) => {
          const selected = value === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: borderRadius.full,
                backgroundColor: selected ? colors.emphasis.muted : 'transparent',
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons
                name={icon as any}
                size={17}
                color={selected ? colors.emphasis.primary : colors.text.muted}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Progress bar + fraction */}
      {totalCount > 0 && (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              flex: 1,
              height: 8,
              backgroundColor: colors.emphasis.muted,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: colors.emphasis.primary,
                borderRadius: 2,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: fontFamily.generalSansMedium,
              fontSize: fontSize.sm,
              color: colors.emphasis.primary,
              minWidth: 32,
              textAlign: 'right',
            }}
          >
            {completedCount}/{totalCount}
          </Text>
        </View>
      )}
    </View>
  );
}
