import { View, Text, Pressable } from 'react-native';
import {
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { colors, letterSpacing, spacing, fontSize, borderRadius, fontFamily } from '@/lib/theme';
import { dbgBorder } from '@/components/now/debug-layout-borders';

const DAY_DEBUG_COLORS = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#14b8a6', '#6366f1', '#d946ef'];
import { toISODate } from '@/lib/utils/date';

type Props = {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
};

export function NowWeekStrip({ selectedDate, onSelectDate }: Props) {
  const anchor = parseISO(selectedDate + 'T12:00:00');
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const blue = colors.emphasis.primary;
  const onBlue = colors.emphasis.onAccent;

  return (
    <View
      style={[
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, marginBottom: spacing.xs },
        dbgBorder('#f97316'),
      ]}
    >
      <View
        style={[
          { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.hairline },
          dbgBorder('#eab308'),
        ]}
      >
        {days.map((d, i) => {
          const iso = toISODate(d);
          const selected = isSameDay(d, anchor);
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate(iso)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  alignItems: 'center',
                  opacity: pressed ? 0.82 : 1,
                },
                dbgBorder(DAY_DEBUG_COLORS[i % DAY_DEBUG_COLORS.length]),
              ]}
            >
              <View
                style={[
                  {
                    width: '100%',
                    maxWidth: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6,
                    paddingHorizontal: spacing.hairline,
                    borderRadius: borderRadius.full,
                    backgroundColor: selected ? blue : 'transparent',
                    borderWidth: 1,
                    borderColor: selected ? blue : colors.border,
                  },
                  dbgBorder('#0ea5e9'),
                ]}
              >
                <Text
                  style={{
                    fontSize: 10,
                    lineHeight: 12,
                    fontFamily: fontFamily.generalSansMedium,
                    letterSpacing: letterSpacing.label,
                    color: selected ? onBlue : colors.text.primary,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="clip"
                >
                  {format(d, 'EEE')}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    lineHeight: 16,
                    fontFamily: fontFamily.generalSansMedium,
                    letterSpacing: letterSpacing.displayTight,
                    color: selected ? onBlue : colors.text.primary,
                    marginTop: 1,
                  }}
                  numberOfLines={1}
                >
                  {format(d, 'd')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
