import { View, Text, Pressable } from 'react-native';
import { Session } from '@/lib/constants';
import { colors, spacing, fontSize, borderRadius, fontFamily, letterSpacing } from '@/lib/theme';
import type { NowSessionFilter } from '@/features/now/use-now-queues';

const CHIPS: { key: NowSessionFilter; label: string }[] = [
  { key: Session.MORNING, label: 'Morning' },
  { key: Session.AFTERNOON, label: 'Afternoon' },
  { key: Session.EVENING, label: 'Evening' },
  { key: 'all', label: 'Day' },
];

type Props = {
  value: NowSessionFilter;
  onChange: (v: NowSessionFilter) => void;
};

export function NowSessionChips({ value, onChange }: Props) {
  const blue = colors.emphasis.primary;
  const onBlue = colors.emphasis.onAccent;

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
        gap: spacing.xs,
      }}
    >
      {CHIPS.map(({ key, label }) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 0,
              paddingVertical: 6,
              paddingHorizontal: spacing.xs,
              borderRadius: borderRadius.full,
              backgroundColor: selected ? blue : 'transparent',
              borderWidth: 1,
              borderColor: selected ? blue : colors.emphasis.line,
              opacity: pressed ? 0.88 : 1,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
            })}
          >
            <Text
              style={{
                fontFamily: fontFamily.generalSansMedium,
                fontSize: fontSize.sm,
                letterSpacing: letterSpacing.control,
                color: selected ? onBlue : blue,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
