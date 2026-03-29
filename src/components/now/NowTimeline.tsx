import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, typographyStyles, borderRadius, fontFamily, letterSpacing } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import type { Session } from '@/lib/constants';
import { SESSION_ORDER, getSessionLabel } from '@/lib/constants/sessions';
import { isJournalQueueItem } from '@/features/queue/journal-queue';

type Props = {
  items: QueueItem[];
  currentSession?: Session;
  onPress: (item: QueueItem) => void;
  readOnly?: boolean;
};

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
    const isDone = item.status === 'completed';
    const map = isDone ? completed : pending;
    const list = map.get(sess);
    if (list) list.push(item);
    else map.set(sess, [item]);
  }
  const allSessions = new Set([...pending.keys(), ...completed.keys()]);
  return SESSION_ORDER
    .filter((s) => allSessions.has(s))
    .map((s) => ({
      session: s,
      label: getSessionLabel(s),
      pending: pending.get(s) ?? [],
      completed: completed.get(s) ?? [],
    }));
}

function getAccentColor(item: QueueItem): string {
  if (isJournalQueueItem(item)) return colors.capture.primary;
  if (item.type === 'action') return colors.actions.primary;
  return colors.routines.primary;
}

function getIconName(item: QueueItem): string {
  if (item.type === 'journal_morning') return 'sunny-outline';
  if (item.type === 'journal_evening') return 'moon-outline';
  if (item.type === 'action') return item.priority === 'high' ? 'flash-outline' : 'checkmark-circle-outline';
  return 'repeat-outline';
}

const ICON_BOX = 30;


export function NowTimeline({ items, currentSession, onPress, readOnly = false }: Props) {
  const groups = useMemo(() => groupBySession(items), [items]);

  const hasPending = groups.some((g) => g.pending.length > 0);

  if (!hasPending && groups.every((g) => g.completed.length === 0)) {
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
      {groups.map((group) => {
        const isCurrent = currentSession === group.session;
        const allItems = [...group.pending, ...group.completed];

        return (
          <View key={group.session}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text
                style={{
                  fontFamily: fontFamily.generalSansMedium,
                  fontSize: 15,
                  lineHeight: 19,
                  letterSpacing: letterSpacing.label,
                  color: colors.emphasis.primary,
                }}
              >
                {group.label}
              </Text>
              {isCurrent && (
                <View
                  style={{
                    marginLeft: spacing.sm,
                    backgroundColor: colors.emphasis.muted,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fontFamily.generalSansMedium,
                      fontSize: 10,
                      lineHeight: 14,
                      letterSpacing: letterSpacing.label,
                      color: colors.emphasis.primary,
                    }}
                  >
                    Now
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                borderRadius: borderRadius.xl,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                overflow: 'hidden',
              }}
            >
              {allItems.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isLast = idx === allItems.length - 1;
                const typeAccent = getAccentColor(item);
                const iconColor = item.isOverdue ? colors.error : typeAccent;
                const iconName = getIconName(item) as any;

                if (isCompleted) {
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
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: spacing.sm,
                          paddingLeft: spacing.sm,
                          paddingRight: spacing.md,
                          gap: spacing.sm,
                        }}
                      >
                        <View
                          style={{
                            width: ICON_BOX,
                            height: ICON_BOX,
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.surfaceRaised,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Ionicons name="checkmark-circle" size={16} color={colors.text.muted} />
                        </View>
                        <Text
                          style={[typographyStyles.title, { color: colors.text.muted, flex: 1 }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={item.id}>
                    <Pressable
                      onPress={() => onPress(item)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                        paddingLeft: spacing.sm,
                        paddingRight: spacing.md,
                        gap: spacing.sm,
                      })}
                    >
                      <View
                        style={{
                          width: ICON_BOX,
                          height: ICON_BOX,
                          borderRadius: borderRadius.md,
                          backgroundColor: iconColor + '1A',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Ionicons name={iconName} size={16} color={iconColor} />
                      </View>
                      <Text
                        style={[typographyStyles.title, { color: colors.text.primary, flex: 1 }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                    </Pressable>

                    {!isLast && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.borderSubtle,
                          marginHorizontal: spacing.md,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
