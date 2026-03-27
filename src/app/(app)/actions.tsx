import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { SegmentedControl, EmptyState } from '@/components/ui';
import { ActionCard } from '@/components/cards/ActionCard';
import { useActions } from '@/features/actions/hooks/useActions';
import { ActionTab } from '@/lib/constants';
import { todayISO, toISODate } from '@/lib/utils/date';
import {
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  isBefore,
  isEqual,
} from 'date-fns';

const TAB_LABELS = [
  'Overdue',
  'Today',
  'Tomorrow',
  'This Week',
  'Next Week',
  'This Month',
  'Future',
  'Hold',
  'Not Scheduled',
];

const EMPTY_MESSAGES: Record<number, string> = {
  0: 'No overdue actions. Nice work staying on top of things.',
  1: 'Nothing scheduled for today.',
  2: 'Nothing scheduled for tomorrow.',
  3: 'This week is clear.',
  4: 'Next week is open.',
  5: 'Nothing this month.',
  6: 'No future actions scheduled.',
  7: 'No actions on hold.',
  8: 'All actions are scheduled.',
};

interface ActionRow {
  id: string;
  title: string;
  scheduledDate: string | null;
  effectiveDate: string | null;
  scheduledSession: string | null;
  effectiveSession: string | null;
  priority: string | null;
  status: string | null;
  isHeld: boolean | null;
  carryForwardCount: number | null;
  deletedAt: string | null;
}

function filterActionsByTab(actions: ActionRow[], tabIndex: number): ActionRow[] {
  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00');
  const tomorrow = toISODate(addDays(todayDate, 1));
  const weekStart = startOfWeek(todayDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(todayDate, { weekStartsOn: 1 });
  const nextWeekStart = addDays(weekEnd, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
  const monthStart = startOfMonth(todayDate);
  const monthEnd = endOfMonth(todayDate);

  // Only show non-deleted pending actions (except specific tab overrides)
  const pending = actions.filter((a) => !a.deletedAt);

  switch (tabIndex) {
    case 0: {
      // Overdue: effective_date < today AND status = pending AND not held
      return pending.filter((a) => {
        if (a.status !== 'pending' || a.isHeld) return false;
        const effectiveDate = a.effectiveDate ?? a.scheduledDate;
        if (!effectiveDate) return false;
        return effectiveDate < today;
      });
    }
    case 1: {
      // Today
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const effectiveDate = a.effectiveDate ?? a.scheduledDate;
        return effectiveDate === today;
      });
    }
    case 2: {
      // Tomorrow
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = a.scheduledDate;
        return date === tomorrow;
      });
    }
    case 3: {
      // This Week (excludes today and tomorrow for clarity)
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = a.scheduledDate;
        if (!date) return false;
        const d = parseISO(date);
        return (
          isWithinInterval(d, { start: weekStart, end: weekEnd }) &&
          date !== today &&
          date !== tomorrow
        );
      });
    }
    case 4: {
      // Next Week
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = a.scheduledDate;
        if (!date) return false;
        const d = parseISO(date);
        return isWithinInterval(d, { start: nextWeekStart, end: nextWeekEnd });
      });
    }
    case 5: {
      // This Month (excluding current and next week)
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = a.scheduledDate;
        if (!date) return false;
        const d = parseISO(date);
        return (
          isWithinInterval(d, { start: monthStart, end: monthEnd }) &&
          !isWithinInterval(d, { start: weekStart, end: nextWeekEnd })
        );
      });
    }
    case 6: {
      // Future: beyond this month
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = a.scheduledDate;
        if (!date) return false;
        const d = parseISO(date);
        return !isBefore(d, addDays(monthEnd, 1)) && !isEqual(d, monthEnd);
      });
    }
    case 7: {
      // Hold
      return pending.filter((a) => a.isHeld && a.status === 'pending');
    }
    case 8: {
      // Not Scheduled
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        return !a.scheduledDate && !a.effectiveDate && !a.isHeld;
      });
    }
    default:
      return [];
  }
}

export default function ActionsScreen() {
  const [selectedTab, setSelectedTab] = useState(1); // Default to "Today"
  const { data: actions, isLoading } = useActions();

  const filteredActions = useMemo(() => {
    if (!actions) return [];
    return filterActionsByTab(actions as ActionRow[], selectedTab);
  }, [actions, selectedTab]);

  const handleCreateAction = useCallback(() => {
    console.log('Create action pressed');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ActionRow }) => {
      const today = todayISO();
      const effectiveDate = item.effectiveDate ?? item.scheduledDate;
      const isOverdue =
        item.status === 'pending' && !item.isHeld && !!effectiveDate && effectiveDate < today;

      return (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <ActionCard
            id={item.id}
            title={item.title}
            scheduledDate={item.scheduledDate}
            effectiveDate={item.effectiveDate}
            scheduledSession={item.scheduledSession as any}
            effectiveSession={item.effectiveSession as any}
            priority={(item.priority ?? 'normal') as 'normal' | 'high'}
            status={item.status ?? 'pending'}
            isOverdue={isOverdue}
          />
        </View>
      );
    },
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text.primary,
          }}
        >
          Actions
        </Text>
      </View>

      {/* Tab bar */}
      <View style={{ paddingBottom: spacing.md }}>
        <SegmentedControl
          segments={TAB_LABELS}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
          accentColor={colors.actions.primary}
          scrollable
        />
      </View>

      {/* Actions list */}
      <FlatList
        data={filteredActions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: spacing['3xl'] + 60, // Extra space for FAB
          ...(filteredActions.length === 0 ? { flex: 1, justifyContent: 'center' as const } : {}),
        }}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.lg }}>
            <EmptyState
              message={EMPTY_MESSAGES[selectedTab] ?? 'No actions here.'}
              accentColor={colors.actions.primary}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        onPress={handleCreateAction}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: spacing['2xl'],
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: borderRadius.full,
          backgroundColor: colors.actions.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          elevation: 6,
          shadowColor: colors.actions.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        })}
      >
        <Text style={{ fontSize: fontSize['2xl'], color: colors.background, fontWeight: '300', marginTop: -2 }}>
          +
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
