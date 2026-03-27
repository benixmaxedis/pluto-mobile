import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';
import { SegmentedControl, EmptyState } from '@/components/ui';
import { FocusCard } from '@/components/cards/FocusCard';
import { QueueItemCard } from '@/components/cards/QueueItemCard';
import { useSessionEngine } from '@/features/queue/hooks/useSessionEngine';
import { useFocusItem, useQueuePreview, useQueue } from '@/features/queue/hooks/useQueue';
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
      return { session: Session.MORNING, date: today }; // "Today" uses current session
    case 4:
      return { session: Session.MORNING, date: tomorrow };
    default:
      return { session: Session.MORNING, date: today };
  }
}

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
        // "Today" tab -- use current auto-detected session
        setSelectedDate(todayISO());
        return;
      }

      setSelectedDate(date);
      setCurrentSession(session);
    },
    [setSelectedDate, setCurrentSession],
  );

  const focusItem = useFocusItem();
  const queuePreview = useQueuePreview(4);
  const fullQueue = useQueue();

  // Compute progress: completed + current pending total for the day
  const completedCount = useMemo(() => {
    if (!fullQueue.data) return 0;
    return 0; // Queue only returns pending items; completed items are filtered out
  }, [fullQueue.data]);

  const totalCount = fullQueue.data?.length ?? 0;

  // Mutations
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

      // Default snooze: next session same day
      const nextSessionIndex = SESSION_ORDER.indexOf(currentSession) + 1;
      const nextSession =
        nextSessionIndex < SESSION_ORDER.length
          ? SESSION_ORDER[nextSessionIndex]
          : Session.MORNING;
      const snoozeDate =
        nextSessionIndex < SESSION_ORDER.length
          ? selectedDate
          : toISODate(addDays(new Date(selectedDate + 'T00:00:00'), 1));

      if (item.type === 'action') {
        snoozeAction.mutate({ id, untilDate: snoozeDate, untilSession: nextSession });
      } else {
        snoozeInstance.mutate({ id, untilSession: nextSession });
      }
    },
    [focusItem.data, currentSession, selectedDate, snoozeAction, snoozeInstance],
  );

  const handleMove = useCallback(
    (id: string) => {
      const item = focusItem.data;
      if (!item) return;

      // Default move: next session same day
      const nextSessionIndex = SESSION_ORDER.indexOf(currentSession) + 1;
      const nextSession =
        nextSessionIndex < SESSION_ORDER.length
          ? SESSION_ORDER[nextSessionIndex]
          : Session.MORNING;
      const moveDate =
        nextSessionIndex < SESSION_ORDER.length
          ? selectedDate
          : toISODate(addDays(new Date(selectedDate + 'T00:00:00'), 1));

      if (item.type === 'action') {
        moveAction.mutate({ id, toDate: moveDate, toSession: nextSession });
      } else {
        moveInstance.mutate({ id, toSession: nextSession });
      }
    },
    [focusItem.data, currentSession, selectedDate, moveAction, moveInstance],
  );

  const displayDate = formatDisplayDate(selectedDate);
  const dayOfWeek = format(new Date(selectedDate + 'T00:00:00'), 'EEEE');
  const sessionLabel = getSessionLabel(currentSession);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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

        {/* Session tabs */}
        <SegmentedControl
          segments={SESSION_TABS}
          selectedIndex={selectedTabIndex}
          onSelect={handleTabSelect}
          scrollable
        />

        {/* Focus card */}
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

        {/* Queue preview */}
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
    </SafeAreaView>
  );
}
