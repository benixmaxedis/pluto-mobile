import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, textStyles } from '@/lib/theme';
import { EmptyState } from '@/components/ui';
import { NowGreeting } from '@/components/now/NowGreeting';
import { NowWeekStrip } from '@/components/now/NowWeekStrip';
import { NowDateEventsPanel } from '@/components/now/NowDateEventsPanel';
import { NowDateSessionPanel } from '@/components/now/NowDateSessionPanel';
import { NowSessionChips } from '@/components/now/NowSessionChips';
import { DATE_PANEL_LAYOUT_DEBUG_UI, dbgBorder } from '@/components/now/debug-layout-borders';
import { useDatePanelLayoutDebug } from '@/components/now/date-panel-layout-debug-context';
import { NowTimeline } from '@/components/now/NowTimeline';
import { SessionHistoryRow } from '@/components/cards/SessionHistoryRow';
import { JournalFormSheet } from '@/components/sheets';
import { type FormSheetRef } from '@/components/sheets/FormSheet';
import { useSessionEngine } from '@/features/queue/hooks/useSessionEngine';
import { isNowSessionPast } from '@/features/queue/engine/session-resolver';
import { isJournalQueueItem } from '@/features/queue/journal-queue';
import { useJournalEntriesByDate } from '@/features/capture/hooks/useJournal';
import { useAppStore } from '@/store/app-store';
import { useCompleteAction, useSkipAction, useSnoozeAction, useMoveAction } from '@/features/actions/hooks/useActionMutations';
import { useCompleteInstance, useSkipInstance, useSnoozeInstance, useMoveInstance } from '@/features/routines/hooks/useRoutineMutations';
import { toISODate, todayISO } from '@/lib/utils/date';
import { SESSION_ORDER } from '@/lib/constants/sessions';
import { Session } from '@/lib/constants';
import { addDays } from 'date-fns';
import {
  useNowQueues,
  pickQueueForFilter,
  type NowSessionFilter,
} from '@/features/now/use-now-queues';
import { useMergedNowHistory } from '@/features/now/use-merged-session-history';

function parseJournalAnswers(entry: { answersJson?: unknown } | null | undefined): Record<string, unknown> | null {
  if (!entry?.answersJson) return null;
  if (typeof entry.answersJson === 'string') {
    try {
      return JSON.parse(entry.answersJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return entry.answersJson as Record<string, unknown>;
}

function sessionEndedForFilter(date: string, filter: NowSessionFilter): boolean {
  if (filter === 'all') {
    if (date < todayISO()) return true;
    if (date > todayISO()) return false;
    return isNowSessionPast(date, Session.EVENING);
  }
  return isNowSessionPast(date, filter);
}

/** Space for FloatingTabBar: `bottom` offset 12 + max(pill, plus) ~64px */
const FLOATING_TAB_BAR_CLEARANCE = 12 + 64;

export default function NowScreen() {
  useSessionEngine();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  /** Greeting + week + date/events + session row — target ≤35% of viewport */
  const headerMaxHeight = Math.round(windowHeight * 0.35);

  const { selectedDate, setSelectedDate, currentSession, setCurrentSession } = useAppStore();
  const today = todayISO();

  const [sessionFilter, setSessionFilter] = useState<NowSessionFilter>(currentSession);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { panelLayoutBorders } = useDatePanelLayoutDebug();

  useEffect(() => {
    if (sessionFilter !== 'all') {
      setCurrentSession(sessionFilter);
    }
  }, [sessionFilter, setCurrentSession]);

  const { data: journalToday } = useJournalEntriesByDate(today);
  const morningEntry = useMemo(
    () => (journalToday ?? []).find((e: { journalType?: string }) => e.journalType === 'morning'),
    [journalToday],
  );
  const eveningEntry = useMemo(
    () => (journalToday ?? []).find((e: { journalType?: string }) => e.journalType === 'evening'),
    [journalToday],
  );
  const hasMorningJournal = !!morningEntry;
  const hasEveningJournal = !!eveningEntry;

  const { morning, afternoon, evening, allSessions } = useNowQueues(
    selectedDate,
    today,
    hasMorningJournal,
    hasEveningJournal,
  );

  const displayQueue = useMemo(
    () => pickQueueForFilter(sessionFilter, morning, afternoon, evening, allSessions),
    [sessionFilter, morning, afternoon, evening, allSessions],
  );

  const queueKey = useMemo(() => displayQueue.map((i) => i.id).join('|'), [displayQueue]);

  useEffect(() => {
    if (displayQueue.length === 0) {
      setExpandedId(null);
      return;
    }
    setExpandedId((prev) => {
      if (prev && displayQueue.some((i) => i.id === prev)) return prev;
      return displayQueue[0].id;
    });
  }, [queueKey, displayQueue]);

  const { skipped: skippedHistory, completed: completedHistory, isFetched: historyFetched } =
    useMergedNowHistory(selectedDate, sessionFilter);
  const hasSessionHistory = skippedHistory.length > 0 || completedHistory.length > 0;

  const sessionEnded = sessionEndedForFilter(selectedDate, sessionFilter);
  const showEmptyMain = displayQueue.length === 0 && historyFetched && !hasSessionHistory;

  const journalSheetRef = useRef<FormSheetRef>(null);
  const [journalSheetType, setJournalSheetType] = useState<'morning' | 'evening'>('morning');

  const openJournal = useCallback((type: 'morning' | 'evening') => {
    setJournalSheetType(type);
    journalSheetRef.current?.present();
  }, []);

  const completeAction = useCompleteAction();
  const skipAction = useSkipAction();
  const snoozeAction = useSnoozeAction();
  const moveAction = useMoveAction();
  const completeInstance = useCompleteInstance();
  const skipInstance = useSkipInstance();
  const snoozeInstance = useSnoozeInstance();
  const moveInstance = useMoveInstance();

  const findItem = useCallback(
    (id: string) => displayQueue.find((i) => i.id === id) ?? null,
    [displayQueue],
  );

  const handleComplete = useCallback(
    (id: string) => {
      const item = findItem(id);
      if (!item || sessionEnded) return;

      if (item.type === 'journal_morning') {
        openJournal('morning');
        return;
      }
      if (item.type === 'journal_evening') {
        openJournal('evening');
        return;
      }

      if (item.type === 'action') {
        completeAction.mutate(id);
      } else {
        completeInstance.mutate(id);
      }
    },
    [findItem, sessionEnded, completeAction, completeInstance, openJournal],
  );

  const handleSkip = useCallback(
    (id: string) => {
      const item = findItem(id);
      if (!item || sessionEnded || isJournalQueueItem(item)) return;

      if (item.type === 'action') {
        skipAction.mutate(id);
      } else {
        skipInstance.mutate(id);
      }
    },
    [findItem, sessionEnded, skipAction, skipInstance],
  );

  const handleSnooze = useCallback(
    (id: string) => {
      const item = findItem(id);
      if (!item || sessionEnded || isJournalQueueItem(item)) return;

      const sess = item.session ?? Session.MORNING;
      const nextSessionIndex = SESSION_ORDER.indexOf(sess) + 1;
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
    [findItem, sessionEnded, selectedDate, snoozeAction, snoozeInstance],
  );

  const handleMove = useCallback(
    (id: string) => {
      const item = findItem(id);
      if (!item || sessionEnded || isJournalQueueItem(item)) return;

      const sess = item.session ?? Session.MORNING;
      const nextSessionIndex = SESSION_ORDER.indexOf(sess) + 1;
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
    [findItem, sessionEnded, selectedDate, moveAction, moveInstance],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const scrollBottomPad =
    insets.bottom +
    FLOATING_TAB_BAR_CLEARANCE +
    spacing.xl +
    (DATE_PANEL_LAYOUT_DEBUG_UI ? 52 : 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: Math.max(spacing['3xl'], scrollBottomPad),
        }}
      >
        <View
          style={[
            { maxHeight: headerMaxHeight, overflow: 'hidden' },
            dbgBorder('#a855f7'),
          ]}
        >
          <NowGreeting />
          <NowWeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <NowDateEventsPanel
            dateIso={selectedDate}
            sessionFilter={sessionFilter}
            panelLayoutBorders={panelLayoutBorders}
          />
          <NowDateSessionPanel
            dateIso={selectedDate}
            sessionFilter={sessionFilter}
          />
        </View>

        <NowSessionChips value={sessionFilter} onChange={setSessionFilter} />

        {showEmptyMain ? (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
            <EmptyState message="Nothing for this day and session. Try another day or filter." />
          </View>
        ) : (
          <NowTimeline
            items={displayQueue}
            expandedId={sessionEnded ? null : expandedId}
            onToggleExpand={handleToggleExpand}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onSnooze={handleSnooze}
            onMove={handleMove}
            readOnly={sessionEnded}
          />
        )}

        {completedHistory.length > 0 && (
          <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="calendar-outline" size={17} color={colors.text.secondary} />
              <Text style={textStyles.sectionLabel}>Completed</Text>
            </View>
            <View style={{ gap: spacing.sm }}>
              {completedHistory.map((row) => (
                <SessionHistoryRow
                  key={`done-${row.id}`}
                  title={row.title}
                  entityLabel={row.type === 'action' ? 'Action' : 'Routine'}
                  outcome="completed"
                />
              ))}
            </View>
          </View>
        )}

        {skippedHistory.length > 0 && (
          <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing['2xl'] }}>
            <Text style={textStyles.sectionLabel}>Missed</Text>
            <View style={{ gap: spacing.sm }}>
              {skippedHistory.map((row) => (
                <SessionHistoryRow
                  key={`skipped-${row.id}`}
                  title={row.title}
                  entityLabel={row.type === 'action' ? 'Action' : 'Routine'}
                  outcome="skipped"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <JournalFormSheet
        ref={journalSheetRef}
        journalType={journalSheetType}
        date={today}
        existingData={
          journalSheetType === 'morning'
            ? parseJournalAnswers(morningEntry ?? null)
            : parseJournalAnswers(eveningEntry ?? null)
        }
      />
    </SafeAreaView>
  );
}
