import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';
import { SegmentedControl, EmptyState, TabSwipePager } from '@/components/ui';
import { FocusCard } from '@/components/cards/FocusCard';
import { QueueItemCard } from '@/components/cards/QueueItemCard';
import { useSessionEngine } from '@/features/queue/hooks/useSessionEngine';
import { useQueue, useFocusItemForSession, useQueuePreviewForSession } from '@/features/queue/hooks/useQueue';
import { useAppStore } from '@/store/app-store';
import { useCompleteAction, useSkipAction, useSnoozeAction, useMoveAction } from '@/features/actions/hooks/useActionMutations';
import { useCompleteInstance, useSkipInstance, useSnoozeInstance, useMoveInstance } from '@/features/routines/hooks/useRoutineMutations';
import { formatDisplayDate, toISODate, todayISO } from '@/lib/utils/date';
import { getSessionLabel, SESSION_ORDER } from '@/lib/constants/sessions';
import { Session } from '@/lib/constants';
import { addDays, format } from 'date-fns';

const SESSION_TABS = ['Morning', 'Afternoon', 'Evening', 'Today', 'Tomorrow'];

function getSessionFromTabIndex(index: number): { session: Session; date: string } {
  const today = todayISO();
  const tomorrow = toISODate(addDays(new Date(), 1));

  switch (index) {
    case 0:
      return { session: Session.MORNING, date: today };
    case 1:
      return { session: Session.AFTERNOON, date: today };
    case 2:
      return { session: Session.EVENING, date: today };
    case 3:
      return { session: Session.MORNING, date: today };
    case 4:
      return { session: Session.MORNING, date: tomorrow };
    default:
      return { session: Session.MORNING, date: today };
  }
}

/** Date + session shown for a Now tab (Today follows live session from the store). */
function getNowTabDateAndSession(tabIndex: number, storeSession: Session): { session: Session; date: string } {
  if (tabIndex === 3) {
    return { session: storeSession, date: todayISO() };
  }
  return getSessionFromTabIndex(tabIndex);
}

const NowTabPage = memo(function NowTabPage({ tabIndex }: { tabIndex: number }) {
  const currentSession = useAppStore((s) => s.currentSession);
  const { date, session } = useMemo(
    () => getNowTabDateAndSession(tabIndex, currentSession),
    [tabIndex, currentSession],
  );

  const focusItem = useFocusItemForSession(date, session);
  const queuePreview = useQueuePreviewForSession(date, session, 4);

  const completeAction = useCompleteAction();
  const skipAction = useSkipAction();
  const snoozeAction = useSnoozeAction();
  const moveAction = useMoveAction();
  const completeInstance = useCompleteInstance();
  const skipInstance = useSkipInstance();
  const snoozeInstance = useSnoozeInstance();
  const moveInstance = useMoveInstance();

  const handleComplete = useCallback(
    (id: string) => {
      const item = focusItem.data;
      if (!item) return;

      if (item.type === 'action') {
        completeAction.mutate(id);
      } else {
        completeInstance.mutate(id);
      }
    },
    [focusItem.data, completeAction, completeInstance],
  );

  const handleSkip = useCallback(
    (id: string) => {
      const item = focusItem.data;
      if (!item) return;

      if (item.type === 'action') {
        skipAction.mutate(id);
      } else {
        skipInstance.mutate(id);
      }
    },
    [focusItem.data, skipAction, skipInstance],
  );

  const handleSnooze = useCallback(
    (id: string) => {
      const item = focusItem.data;
      if (!item) return;

      const nextSessionIndex = SESSION_ORDER.indexOf(session) + 1;
      const nextSession =
        nextSessionIndex < SESSION_ORDER.length
          ? SESSION_ORDER[nextSessionIndex]
          : Session.MORNING;
      const snoozeDate =
        nextSessionIndex < SESSION_ORDER.length
          ? date
          : toISODate(addDays(new Date(date + 'T00:00:00'), 1));

      if (item.type === 'action') {
        snoozeAction.mutate({ id, untilDate: snoozeDate, untilSession: nextSession });
      } else {
        snoozeInstance.mutate({ id, untilSession: nextSession });
      }
    },
    [focusItem.data, session, date, snoozeAction, snoozeInstance],
  );

  const handleMove = useCallback(
    (id: string) => {
      const item = focusItem.data;
      if (!item) return;

      const nextSessionIndex = SESSION_ORDER.indexOf(session) + 1;
      const nextSession =
        nextSessionIndex < SESSION_ORDER.length
          ? SESSION_ORDER[nextSessionIndex]
          : Session.MORNING;
      const moveDate =
        nextSessionIndex < SESSION_ORDER.length
          ? date
          : toISODate(addDays(new Date(date + 'T00:00:00'), 1));

      if (item.type === 'action') {
        moveAction.mutate({ id, toDate: moveDate, toSession: nextSession });
      } else {
        moveInstance.mutate({ id, toSession: nextSession });
      }
    },
    [focusItem.data, session, date, moveAction, moveInstance],
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {focusItem.data ? (
        <FocusCard
          item={focusItem.data}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onSnooze={handleSnooze}
          onMove={handleMove}
        />
      ) : (
        <EmptyState message="Nothing right now. You're all caught up." />
      )}

      {queuePreview.data && queuePreview.data.length > 0 && (
        <View style={{ gap: spacing.md }}>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.text.secondary,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Up Next
          </Text>
          <View style={{ gap: spacing.sm }}>
            {queuePreview.data.map((item) => (
              <QueueItemCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
});

export default function NowScreen() {
  useSessionEngine();

  const { selectedDate, currentSession, setSelectedDate, setCurrentSession } = useAppStore();

  const currentSessionIndex = SESSION_ORDER.indexOf(currentSession);
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    currentSessionIndex >= 0 ? currentSessionIndex : 0,
  );

  const handleTabSelect = useCallback(
    (index: number) => {
      setSelectedTabIndex(index);
      const { session, date } = getSessionFromTabIndex(index);

      if (index === 3) {
        setSelectedDate(todayISO());
        return;
      }

      setSelectedDate(date);
      setCurrentSession(session);
    },
    [setSelectedDate, setCurrentSession],
  );

  const fullQueue = useQueue();
  const totalCount = fullQueue.data?.length ?? 0;

  const displayDate = formatDisplayDate(selectedDate);
  const dayOfWeek = format(new Date(selectedDate + 'T00:00:00'), 'EEEE');
  const sessionLabel = getSessionLabel(currentSession);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: spacing.lg, paddingHorizontal: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
            {displayDate} &middot; {dayOfWeek}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text.primary }}>
              {sessionLabel}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
              {totalCount} remaining
            </Text>
          </View>
        </View>

        <SegmentedControl
          segments={SESSION_TABS}
          selectedIndex={selectedTabIndex}
          onSelect={handleTabSelect}
          scrollable
        />
      </View>

      <TabSwipePager selectedIndex={selectedTabIndex} onIndexChange={handleTabSelect} style={{ flex: 1 }}>
        {SESSION_TABS.map((_, i) => (
          <View key={SESSION_TABS[i]} style={{ flex: 1 }} collapsable={false}>
            <NowTabPage tabIndex={i} />
          </View>
        ))}
      </TabSwipePager>
    </SafeAreaView>
  );
}
