import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { SegmentedControl, EmptyState, TabSwipePager } from '@/components/ui';
import { ScreenTabHeader } from '@/components/navigation/ScreenTabHeader';
import { ActionCard } from '@/components/cards/ActionCard';
import { RoutineCard } from '@/components/cards/RoutineCard';
import { ActionFormSheet, RoutineFormSheet } from '@/components/sheets';
import { useActions } from '@/features/actions/hooks/useActions';
import { useRoutineTemplates } from '@/features/routines/hooks/useRoutines';
import { LifeCategory } from '@/lib/constants';
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
import type { RecurrenceType, Session } from '@/lib/constants';

// ── Types ─────────────────────────────────────────────────────────────────────

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
}

interface TemplateRow {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  defaultSession: string | null;
  recurrenceType: string;
  recurrenceDaysJson: string | null;
  isActive: boolean | null;
  deletedAt: string | null;
}

// ── Actions tabs ───────────────────────────────────────────────────────────────

const ACTION_TAB_LABELS = [
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

const ACTION_EMPTY: Record<number, string> = {
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

  const pending = actions.filter((a) => !a.deletedAt);

  switch (tabIndex) {
    case 0:
      return pending.filter((a) => {
        if (a.status !== 'pending' || a.isHeld) return false;
        const canonical = toComparableDate(a.effectiveDate) ?? toComparableDate(a.scheduledDate);
        if (!canonical) return false;
        return canonical < today;
      });
    case 1:
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const sched = toComparableDate(a.scheduledDate);
        const eff = toComparableDate(a.effectiveDate);
        return sched === today || eff === today;
      });
    case 2:
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        return toComparableDate(a.scheduledDate) === tomorrow;
      });
    case 3:
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
    case 4:
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
        return isWithinInterval(d, { start: nextWeekStart, end: nextWeekEnd });
      });
    case 5:
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
    case 6:
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        const date = toComparableDate(a.scheduledDate);
        if (!date) return false;
        const d = parseISO(date + 'T12:00:00');
        return !isBefore(d, addDays(monthEnd, 1)) && !isEqual(d, monthEnd);
      });
    case 7:
      return pending.filter((a) => a.isHeld && a.status === 'pending');
    case 8:
      return pending.filter((a) => {
        if (a.status !== 'pending') return false;
        return !a.scheduledDate && !a.effectiveDate && !a.isHeld;
      });
    default:
      return [];
  }
}

// ── Routines tabs ──────────────────────────────────────────────────────────────

const ROUTINE_CATEGORY_TABS = [
  'All',
  'Sleep',
  'Health',
  'Home',
  'Work',
  'Finance',
  'Self Care',
  'Social',
  'Learning',
  'Family',
  'Other',
];

const ROUTINE_CATEGORY_VALUES: (string | null)[] = [
  null,
  LifeCategory.SLEEP,
  LifeCategory.HEALTH,
  LifeCategory.HOME,
  LifeCategory.WORK,
  LifeCategory.FINANCE,
  LifeCategory.SELF_CARE,
  LifeCategory.SOCIAL,
  LifeCategory.LEARNING,
  LifeCategory.FAMILY,
  LifeCategory.OTHER,
];

// ── Main sections ──────────────────────────────────────────────────────────────

const SECTIONS = ['Actions', 'Routines'];

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ActionsScreen() {
  const [selectedSection, setSelectedSection] = useState(0);

  // Actions sub-state
  const [actionTab, setActionTab] = useState(1); // default "Today"
  const { data: actions } = useActions();
  const actionFormRef = useRef<FormSheetRef>(null);
  const [editAction, setEditAction] = useState<ActionRow | null>(null);

  // Routines sub-state
  const [routineTab, setRoutineTab] = useState(0);
  const { data: templates } = useRoutineTemplates();
  const [routineSheetOpen, setRoutineSheetOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TemplateRow | null>(null);

  const handleCreateAction = useCallback(() => {
    setEditAction(null);
    actionFormRef.current?.present();
  }, []);

  const handleCreateRoutine = useCallback(() => {
    setEditTemplate(null);
    setRoutineSheetOpen(true);
  }, []);

  // ── Actions data ─────────────────────────────────────────────────────────────

  const filteredActionsByTab = useMemo(() => {
    if (!actions) return ACTION_TAB_LABELS.map(() => [] as ActionRow[]);
    const rows = actions as ActionRow[];
    return ACTION_TAB_LABELS.map((_, i) => filterActionsByTab(rows, i));
  }, [actions]);

  const actionCount = filteredActionsByTab[actionTab]?.length ?? 0;
  const actionCountLabel = actionCount === 1 ? '1 action' : `${actionCount} actions`;

  const handleEditAction = useCallback((item: ActionRow) => {
    setEditAction(item);
    actionFormRef.current?.present();
  }, []);

  const renderActionItem = useCallback(
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
            isOverdue={isOverdue}
          />
        </Pressable>
      );
    },
    [handleEditAction],
  );

  // ── Routines data ─────────────────────────────────────────────────────────────

  const filteredRoutinesByTab = useMemo(() => {
    if (!templates) return ROUTINE_CATEGORY_TABS.map(() => [] as TemplateRow[]);
    const rows = templates as TemplateRow[];
    return ROUTINE_CATEGORY_TABS.map((_, i) => {
      const catFilter = ROUTINE_CATEGORY_VALUES[i];
      if (catFilter === null) return rows.filter((t) => !t.deletedAt);
      return rows.filter((t) => !t.deletedAt && t.category === catFilter);
    });
  }, [templates]);

  const routineCount = filteredRoutinesByTab[routineTab]?.length ?? 0;
  const routineCountLabel = routineCount === 1 ? '1 routine' : `${routineCount} routines`;

  const handleEditRoutine = useCallback((item: TemplateRow) => {
    setEditTemplate(item);
    setRoutineSheetOpen(true);
  }, []);

  const handleRoutineSheetDismiss = useCallback(() => {
    setRoutineSheetOpen(false);
    setEditTemplate(null);
  }, []);

  const renderRoutineItem = useCallback(
    ({ item }: { item: TemplateRow }) => (
      <Pressable
        onPress={() => handleEditRoutine(item)}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}
      >
        <RoutineCard
          id={item.id}
          title={item.title}
          category={item.category}
          defaultSession={item.defaultSession as Session | null}
          recurrenceType={item.recurrenceType as RecurrenceType}
          recurrenceDaysJson={item.recurrenceDaysJson}
          isActive={item.isActive ?? true}
        />
      </Pressable>
    ),
    [handleEditRoutine],
  );

  const accentColor = selectedSection === 0 ? colors.actions.primary : colors.routines.primary;
  const trailingLabel = selectedSection === 0 ? actionCountLabel : routineCountLabel;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenTabHeader title="Actions" trailing={trailingLabel}>
        <SegmentedControl
          segments={SECTIONS}
          selectedIndex={selectedSection}
          onSelect={setSelectedSection}
          accentColor={accentColor}
          selectionStyle="neutral"
        />
      </ScreenTabHeader>

      <TabSwipePager
        selectedIndex={selectedSection}
        onIndexChange={setSelectedSection}
        style={{ flex: 1 }}
      >
        {/* ── Actions section ── */}
        <View style={{ flex: 1 }} collapsable={false}>
          <View style={{ marginBottom: spacing.md }}>
            <SegmentedControl
              segments={ACTION_TAB_LABELS}
              selectedIndex={actionTab}
              onSelect={setActionTab}
              accentColor={colors.actions.primary}
              scrollable
              selectionStyle="neutral"
            />
          </View>

          <TabSwipePager
            selectedIndex={actionTab}
            onIndexChange={setActionTab}
            style={{ flex: 1 }}
          >
            {ACTION_TAB_LABELS.map((_, tabIdx) => {
              const filteredActions = filteredActionsByTab[tabIdx] ?? [];
              return (
                <View key={ACTION_TAB_LABELS[tabIdx]} style={{ flex: 1 }} collapsable={false}>
                  <FlatList
                    data={filteredActions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderActionItem}
                    nestedScrollEnabled
                    contentContainerStyle={{
                      paddingBottom: spacing['3xl'] + 60,
                      ...(filteredActions.length === 0
                        ? { flex: 1, justifyContent: 'center' as const }
                        : {}),
                    }}
                    ListEmptyComponent={
                      <View style={{ paddingHorizontal: spacing.lg }}>
                        <EmptyState
                          message={ACTION_EMPTY[tabIdx] ?? 'No actions here.'}
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
        </View>

        {/* ── Routines section ── */}
        <View style={{ flex: 1 }} collapsable={false}>
          <View style={{ marginBottom: spacing.md }}>
            <SegmentedControl
              segments={ROUTINE_CATEGORY_TABS}
              selectedIndex={routineTab}
              onSelect={setRoutineTab}
              accentColor={colors.routines.primary}
              scrollable
              selectionStyle="neutral"
            />
          </View>

          <TabSwipePager
            selectedIndex={routineTab}
            onIndexChange={setRoutineTab}
            style={{ flex: 1 }}
          >
            {ROUTINE_CATEGORY_TABS.map((_, tabIdx) => {
              const filteredTemplates = filteredRoutinesByTab[tabIdx] ?? [];
              return (
                <View key={ROUTINE_CATEGORY_TABS[tabIdx]} style={{ flex: 1 }} collapsable={false}>
                  <FlatList
                    data={filteredTemplates}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRoutineItem}
                    nestedScrollEnabled
                    contentContainerStyle={{
                      paddingBottom: spacing['3xl'] + 60,
                      ...(filteredTemplates.length === 0
                        ? { flex: 1, justifyContent: 'center' as const }
                        : {}),
                    }}
                    ListEmptyComponent={
                      <View style={{ paddingHorizontal: spacing.lg }}>
                        <EmptyState
                          message={
                            ROUTINE_CATEGORY_VALUES[tabIdx] === null
                              ? 'No routines yet. Build your rhythm here.'
                              : `No ${ROUTINE_CATEGORY_TABS[tabIdx].toLowerCase()} routines yet.`
                          }
                          accentColor={colors.routines.primary}
                        />
                      </View>
                    }
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              );
            })}
          </TabSwipePager>
        </View>
      </TabSwipePager>

      {/* Form Sheets */}
      <ActionFormSheet
        ref={actionFormRef}
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
              }
            : null
        }
        onDismiss={() => setEditAction(null)}
      />

      <RoutineFormSheet
        visible={routineSheetOpen}
        onDismiss={handleRoutineSheetDismiss}
        editId={editTemplate?.id}
        editData={
          editTemplate
            ? {
                title: editTemplate.title,
                notes: editTemplate.notes ?? undefined,
                category: editTemplate.category as any,
                defaultSession: editTemplate.defaultSession as any,
                recurrenceType: editTemplate.recurrenceType as any,
                recurrenceDaysJson: editTemplate.recurrenceDaysJson ?? undefined,
              }
            : null
        }
      />
    </SafeAreaView>
  );
}
