import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { SegmentedControl, EmptyState, TabSwipePager } from '@/components/ui';
import { ScreenTabHeader } from '@/components/navigation/ScreenTabHeader';
import { ActionCard } from '@/components/cards/ActionCard';
import { ActionFormSheet } from '@/components/sheets';
import { useActions } from '@/features/actions/hooks/useActions';
import { todayISO, toISODate, toComparableDate } from '@/lib/utils/date';
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
  notes: string | null;
  scheduledDate: string | null;
  effectiveDate: string | null;
  scheduledSession: string | null;
  effectiveSession: string | null;
  priority: string | null;
  status: string | null;
  isHeld: boolean | null;
  carryForwardCount: number | null;
  deletedAt: string | null;
  subtasks?:
    | Array<{
        id: string;
        title: string;
        isCompleted: boolean | null;
        completedAt: string | null;
        createdAt: string;
      }>
    | null;
  subtaskProgress?: { completed: number; total: number } | null;
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
        const canonical =
          toComparableDate(a.effectiveDate) ?? toComparableDate(a.scheduledDate);
        if (!canonical) return false;
        return canonical < today;
      });
    }
    case 1: {
      // Today: scheduled or effective lands on today (handles stale effective vs fresh scheduled)
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const sched = toComparableDate(a.scheduledDate);
        const eff = toComparableDate(a.effectiveDate);
        return sched === today || eff === today;
      });
    }
    case 2: {
      // Tomorrow
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        return toComparableDate(a.scheduledDate) === tomorrow;
      });
    }
    case 3: {
      // This Week (excludes today and tomorrow for clarity)
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
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
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
        return isWithinInterval(d, { start: nextWeekStart, end: nextWeekEnd });
      });
    }
    case 5: {
      // This Month (excluding current and next week)
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
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
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
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
  const { data: actions } = useActions();
  const formSheetRef = useRef<FormSheetRef>(null);
  const [editAction, setEditAction] = useState<ActionRow | null>(null);

  const filteredByTab = useMemo(() => {
    if (!actions) return TAB_LABELS.map(() => [] as ActionRow[]);
    const rows = actions as ActionRow[];
    return TAB_LABELS.map((_, i) => filterActionsByTab(rows, i));
  }, [actions]);

  const actionCount = filteredByTab[selectedTab]?.length ?? 0;
  const actionCountLabel =
    actionCount === 1 ? '1 action' : `${actionCount} actions`;

  const handleCreateAction = useCallback(() => {
    setEditAction(null);
    formSheetRef.current?.present();
  }, []);

  const handleEditAction = useCallback((item: ActionRow) => {
    setEditAction(item);
    formSheetRef.current?.present();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ActionRow }) => {
      const today = todayISO();
      const canonical =
        toComparableDate(item.effectiveDate) ?? toComparableDate(item.scheduledDate);
      const isOverdue =
        item.status === 'pending' && !item.isHeld && !!canonical && canonical < today;

      return (
        <Pressable
          onPress={() => handleEditAction(item)}
          style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}
        >
          <ActionCard
            id={item.id}
            title={item.title}
            scheduledDate={item.scheduledDate}
            effectiveDate={item.effectiveDate}
            scheduledSession={item.scheduledSession as any}
            effectiveSession={item.effectiveSession as any}
            priority={(item.priority ?? 'normal') as 'normal' | 'high'}
            status={item.status ?? 'pending'}
            subtaskProgress={item.subtaskProgress ?? null}
            isOverdue={isOverdue}
          />
        </Pressable>
      );
    },
    [handleEditAction],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenTabHeader title="Actions" trailing={actionCountLabel}>
        <SegmentedControl
          segments={TAB_LABELS}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
          accentColor={colors.actions.primary}
          scrollable
          selectionStyle="neutral"
        />
      </ScreenTabHeader>

      <TabSwipePager selectedIndex={selectedTab} onIndexChange={setSelectedTab} style={{ flex: 1 }}>
        {TAB_LABELS.map((_, tabIdx) => {
          const filteredActions = filteredByTab[tabIdx] ?? [];
          return (
            <View key={TAB_LABELS[tabIdx]} style={{ flex: 1 }} collapsable={false}>
              <FlatList
                data={filteredActions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                nestedScrollEnabled
                contentContainerStyle={{
                  paddingBottom: spacing['3xl'] + 60,
                  ...(filteredActions.length === 0 ? { flex: 1, justifyContent: 'center' as const } : {}),
                }}
                ListEmptyComponent={
                  <View style={{ paddingHorizontal: spacing.lg }}>
                    <EmptyState
                      message={EMPTY_MESSAGES[tabIdx] ?? 'No actions here.'}
                      accentColor={colors.actions.primary}
                    />
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            </View>
          );
        })}
      </TabSwipePager>

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

      {/* Form Sheet */}
      <ActionFormSheet
        ref={formSheetRef}
        editId={editAction?.id}
        editData={
          editAction
            ? {
                title: editAction.title,
                notes: editAction.notes ?? undefined,
                scheduledDate: editAction.scheduledDate ?? undefined,
                scheduledSession: editAction.scheduledSession as any,
                priority: (editAction.priority as any) ?? 'normal',
                isHeld: editAction.isHeld ?? false,
                subtasks:
                  editAction.subtasks?.map((subtask) => ({
                    id: subtask.id,
                    title: subtask.title,
                    isCompleted: subtask.isCompleted ?? false,
                    completedAt: subtask.completedAt ?? null,
                    createdAt: subtask.createdAt,
                  })) ?? [],
              }
            : null
        }
        onDismiss={() => setEditAction(null)}
      />
    </SafeAreaView>
  );
}
