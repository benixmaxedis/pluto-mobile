import { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivityEventsByDate } from '@/features/activity/hooks/useActivityLog';
import { toISODate, formatDisplayDate } from '@/lib/utils/date';
import { subDays, format } from 'date-fns';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { Card, EmptyState } from '@/components/ui';
import { EventType } from '@/lib/constants';

const EVENT_META: Record<string, { label: string; icon: string; color: string }> = {
  [EventType.ACTION_CREATED]: { label: 'Action created', icon: '\u271A', color: colors.actions.primary },
  [EventType.ACTION_COMPLETED]: { label: 'Action completed', icon: '\u2713', color: colors.success },
  [EventType.ACTION_SKIPPED]: { label: 'Action skipped', icon: '\u2192', color: colors.text.muted },
  [EventType.ACTION_SNOOZED]: { label: 'Action snoozed', icon: '\u23F8', color: colors.warning },
  [EventType.ACTION_AUTO_CARRIED_FORWARD]: { label: 'Action carried forward', icon: '\u21B7', color: colors.info },
  [EventType.ACTION_MOVED]: { label: 'Action moved', icon: '\u2194', color: colors.info },
  [EventType.ROUTINE_COMPLETED]: { label: 'Routine completed', icon: '\u2713', color: colors.routines.primary },
  [EventType.ROUTINE_SKIPPED]: { label: 'Routine skipped', icon: '\u2192', color: colors.text.muted },
  [EventType.ROUTINE_SNOOZED]: { label: 'Routine snoozed', icon: '\u23F8', color: colors.warning },
  [EventType.ROUTINE_MOVED]: { label: 'Routine moved', icon: '\u2194', color: colors.routines.primary },
  [EventType.OPEN_LOOP_CREATED]: { label: 'Open loop captured', icon: '\u25CB', color: colors.capture.primary },
  [EventType.OPEN_LOOP_CONVERTED]: { label: 'Open loop converted', icon: '\u2B06', color: colors.capture.primary },
  [EventType.GUIDE_ITEM_CREATED]: { label: 'Guide item created', icon: '\u2606', color: colors.guide.primary },
  [EventType.STRATEGY_CREATED]: { label: 'Strategy created', icon: '\u26A1', color: colors.strategies.primary },
  [EventType.JOURNAL_COMPLETED]: { label: 'Journal completed', icon: '\u270E', color: colors.capture.primary },
  [EventType.MOMENTUM_CHAIN_CREATED]: { label: 'Chain created', icon: '\u26D3', color: colors.actions.primary },
  [EventType.MOMENTUM_CHAIN_UPDATED]: { label: 'Chain updated', icon: '\u26D3', color: colors.actions.primary },
  [EventType.MOMENTUM_CHAIN_SUGGESTED_BY_PLUTO]: { label: 'Chain suggested', icon: '\u2728', color: colors.actions.primary },
};

function buildDateRange(): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(subDays(today, i));
  }
  return dates;
}

export default function ActivityScreen() {
  const dateRange = useMemo(() => buildDateRange(), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const selectedDate = dateRange[selectedDateIndex];
  const selectedDateISO = toISODate(selectedDate);

  const { data: events, isLoading } = useActivityEventsByDate(selectedDateISO);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}
        >
          Activity
        </Text>

        {/* Date selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {dateRange.map((date, index) => {
            const isSelected = index === selectedDateIndex;
            const dayLabel = index === 0 ? 'Today' : format(date, 'EEE');
            const dateLabel = format(date, 'd');

            return (
              <Pressable
                key={index}
                onPress={() => setSelectedDateIndex(index)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.lg,
                  backgroundColor: isSelected ? `${colors.actions.primary}22` : 'transparent',
                  borderWidth: 1,
                  borderColor: isSelected ? colors.actions.primary : colors.border,
                  minWidth: 52,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: isSelected ? colors.actions.primary : colors.text.muted,
                    fontWeight: '600',
                  }}
                >
                  {dayLabel}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.md,
                    color: isSelected ? colors.actions.primary : colors.text.primary,
                    fontWeight: '700',
                    marginTop: 2,
                  }}
                >
                  {dateLabel}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        {(events ?? []).length === 0 && !isLoading ? (
          <EmptyState message="No activity for this day." accentColor={colors.actions.primary} />
        ) : (
          <FlatList
            data={events ?? []}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing['3xl'] }}
            renderItem={({ item }: { item: any }) => {
              const meta = EVENT_META[item.eventType] ?? {
                label: item.eventType,
                icon: '\u2022',
                color: colors.text.muted,
              };
              const timestamp = item.createdAt
                ? format(new Date(item.createdAt), 'h:mm a')
                : '';

              return (
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: `${meta.color}22`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: fontSize.base, color: meta.color }}>
                        {meta.icon}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: fontSize.base,
                          color: colors.text.primary,
                          fontWeight: '500',
                        }}
                        numberOfLines={1}
                      >
                        {meta.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          color: colors.text.muted,
                          marginTop: 2,
                        }}
                      >
                        {item.entityType?.replace('_', ' ')} {timestamp ? `\u2022 ${timestamp}` : ''}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
