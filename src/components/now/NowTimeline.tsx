import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, spacing, typographyStyles, borderRadius, fontFamily, letterSpacing } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import type { Session } from '@/lib/constants';
import { SESSION_ORDER, getSessionLabel } from '@/lib/constants/sessions';
import { isJournalQueueItem } from '@/features/queue/journal-queue';
import { isNowSessionPast } from '@/features/queue/engine/session-resolver';
import { itemScheduledSessionAppearsInView } from '@/features/queue/session-attribution';
import { useActionSubtasks } from '@/features/actions/hooks/useActions';
import { useToggleSubtask } from '@/features/actions/hooks/useActionMutations';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  items: QueueItem[];
  currentSession?: Session;
  onPress: (item: QueueItem) => void;
  readOnly?: boolean;
  showFocusCard?: boolean;
  selectedDate?: string;
  todayDate?: string;
};

function getSessionSuffix(
  session: Session,
  currentSession: Session | undefined,
  selectedDate: string | undefined,
  todayDate: string | undefined,
): string {
  if (!selectedDate || !todayDate) return '';
  if (selectedDate < todayDate) return ' — Completed';
  if (selectedDate > todayDate) return '';
  // viewing today
  if (isNowSessionPast(todayDate, session)) return ' — Completed';
  if (session === currentSession) return ' — In Progress';
  return '';
}

type SessionGroup = {
  session: Session;
  label: string;
  pending: QueueItem[];
  completed: QueueItem[];
};

function groupBySession(items: QueueItem[]): SessionGroup[] {
  const pending = new Map<Session, QueueItem[]>();
  const completed = new Map<Session, QueueItem[]>();
  for (const item of items) {
    const sess = item.session ?? SESSION_ORDER[0];
    const isDone = item.status === 'completed' || item.status === 'skipped';
    const map = isDone ? completed : pending;
    const list = map.get(sess);
    if (list) list.push(item);
    else map.set(sess, [item]);
  }
  const allSessions = new Set([...pending.keys(), ...completed.keys()]);
  return [...SESSION_ORDER].reverse()
    .filter((s) => allSessions.has(s))
    .map((s) => ({
      session: s,
      label: getSessionLabel(s),
      pending: pending.get(s) ?? [],
      completed: completed.get(s) ?? [],
    }));
}

function getAccentColor(item: QueueItem): string {
  if (isJournalQueueItem(item)) return colors.guide.primary;
  if (item.type === 'action') return colors.actions.primary;
  return colors.routines.primary;
}

const CATEGORY_ICONS: Record<string, string> = {
  sleep:     'moon-outline',
  health:    'heart-outline',
  home:      'home-outline',
  work:      'briefcase-outline',
  finance:   'wallet-outline',
  self_care: 'flower-outline',
  social:    'people-outline',
  learning:  'book-outline',
  family:    'people-circle-outline',
  other:     'ellipsis-horizontal-circle-outline',
};

function getIconName(item: QueueItem): string {
  if (item.type === 'journal_morning') return 'sunny-outline';
  if (item.type === 'journal_evening') return 'moon-outline';
  if (item.type === 'action') return item.priority === 'high' ? 'flash-outline' : 'checkmark-circle-outline';
  if (item.type === 'routine_instance' && item.routineCategory) {
    return CATEGORY_ICONS[item.routineCategory] ?? 'repeat-outline';
  }
  return 'repeat-outline';
}

function getKindLabel(item: QueueItem): string {
  if (isJournalQueueItem(item)) return 'Journal';
  if (item.type === 'action') return 'Action';
  if (item.routineCategory) {
    return item.routineCategory
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'Routine';
}

function renderLeadingIcon(item: QueueItem, size: number): React.ReactNode {
  if (item.status === 'completed') {
    return <FontAwesome name="check-circle" size={size} color={colors.success} />;
  }
  if (item.status === 'skipped') {
    return <FontAwesome name="minus-circle" size={size} color={colors.text.secondary} />;
  }
  const accent = getAccentColor(item);
  const iconColor = item.isOverdue ? colors.error : accent;
  return <Ionicons name={getIconName(item) as any} size={size} color={iconColor} />;
}

function renderSessionLabel(label: string) {
  return (
    <Text
      style={{
        fontFamily: fontFamily.generalSansMedium,
        fontSize: 15,
        lineHeight: 19,
        letterSpacing: letterSpacing.label,
        color: colors.emphasis.primary,
      }}
    >
      {label}
    </Text>
  );
}

function FocusCard({ item, onPress }: { item: QueueItem; onPress: () => void }) {
  const { data: subtasks } = useActionSubtasks(item.type === 'action' ? item.id : null);
  const hasSubtasks = subtasks && subtasks.length > 0;
  const toggleSubtask = useToggleSubtask();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient
        colors={[colors.capture.primary, colors.emphasis.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: borderRadius.xl, padding: 1 }}
      >
      <View
        style={{
          borderRadius: borderRadius.xl - 1,
          backgroundColor: colors.surfaceRaised,
          overflow: 'hidden',
        }}
      >
      {/* Title row — same padding and icon size as regular list rows */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
        }}
      >
        {renderLeadingIcon(item, 15)}
        <Text
          style={[typographyStyles.title, {
            color: item.isOverdue ? colors.error : colors.text.primary,
            flex: 1,
          }]}
          numberOfLines={3}
        >
          {item.title}
        </Text>
      </View>

      {hasSubtasks && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.borderSubtle,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            gap: spacing.sm,
          }}
        >
          {subtasks.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() => toggleSubtask.mutate({ id: sub.id, isCompleted: !sub.isCompleted })}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}
            >
              {sub.isCompleted
                ? <FontAwesome name="check-circle" size={14} color={colors.success} />
                : <Ionicons name="ellipse-outline" size={14} color={colors.text.secondary} />
              }
              <Text
                style={{
                  fontFamily: fontFamily.generalSansMedium,
                  fontSize: 14,
                  lineHeight: 18,
                  color: sub.isCompleted ? colors.text.secondary : colors.text.primary,
                  flex: 1,
                  textDecorationLine: sub.isCompleted ? 'line-through' : 'none',
                }}
                numberOfLines={2}
              >
                {sub.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      </View>
      </LinearGradient>
    </Pressable>
  );
}

export function NowTimeline({ items, currentSession, onPress, readOnly = false, showFocusCard = false, selectedDate, todayDate }: Props) {
  const focusItem = useMemo(
    () =>
      showFocusCard
        ? items.find(
            (i) =>
              i.status === 'pending' &&
              currentSession != null &&
              (i.session === null || itemScheduledSessionAppearsInView(i.session, currentSession)),
          ) ?? null
        : null,
    [items, currentSession, showFocusCard],
  );

  const restItems = useMemo(
    () => (focusItem ? items.filter((i) => i.id !== focusItem.id) : items),
    [items, focusItem],
  );

  const groups = useMemo(() => groupBySession(restItems), [restItems]);

  const hasAny = focusItem !== null || groups.some((g) => g.pending.length > 0 || g.completed.length > 0);

  if (!hasAny) {
    return (
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, marginTop: spacing.sm }}>
        <Text style={[typographyStyles.bodySmall, { color: colors.text.secondary, textAlign: 'center' }]}>
          Nothing scheduled for this view.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'], marginTop: spacing.sm, gap: spacing.lg }}>

      {/* Focus card: heading + card wrapped so heading is spacing.xs from card */}
      {focusItem && (
        <View style={{ gap: spacing.xs }}>
          {currentSession && renderSessionLabel(`${getSessionLabel(currentSession)} — In Progress`)}
          <FocusCard item={focusItem} onPress={() => onPress(focusItem)} />
        </View>
      )}

      {/* Session groups */}
      {groups.length > 0 && (
        <View style={{ gap: spacing.lg }}>
          {groups.map((group) => {
            const allItems = [...group.pending, ...group.completed];
            const suppressLabel = showFocusCard && focusItem !== null && group.session === currentSession;
            const suffix = getSessionSuffix(group.session, currentSession, selectedDate, todayDate);
            const groupLabel = `${group.label}${suffix}`;

            return (
              <View key={group.session}>
                {!suppressLabel && (
                  <View style={{ marginBottom: spacing.xs }}>
                    {renderSessionLabel(groupLabel)}
                  </View>
                )}

                <View
                  style={{
                    borderRadius: borderRadius.xl,
                    backgroundColor: colors.surfaceRaised,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: 'hidden',
                  }}
                >
                  {allItems.map((item, idx) => {
                    const isTerminal = item.status === 'completed' || item.status === 'skipped';
                    const titleColor = item.isOverdue && !isTerminal ? colors.error : colors.text.primary;

                    const row = (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.md,
                          gap: spacing.sm,
                        }}
                      >
                        {renderLeadingIcon(item, 15)}
                        <Text
                          style={[typographyStyles.title, { color: titleColor, flex: 1 }]}
                          numberOfLines={2}
                        >
                          {item.title}
                        </Text>
                      </View>
                    );

                    return (
                      <View key={item.id}>
                        {idx > 0 && (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: colors.borderSubtle,
                              marginHorizontal: spacing.md,
                            }}
                          />
                        )}
                        {isTerminal ? row : (
                          <Pressable
                            onPress={() => onPress(item)}
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                          >
                            {row}
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
