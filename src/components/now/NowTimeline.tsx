import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
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

function getKindLabel(item: QueueItem): string {
  if (isJournalQueueItem(item)) return 'Journal';
  if (item.type === 'action') return 'Action';
  return 'Routine';
}

const ACCENT_BAR_W = 3;

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={colors.text.muted}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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
                const barColor = item.isOverdue ? colors.error : typeAccent;
                const kind = getKindLabel(item);

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
                          paddingLeft: spacing.md,
                          paddingRight: spacing.md,
                          gap: spacing.sm,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: colors.surfaceRaised,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CheckIcon />
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
                      disabled={readOnly}
                      onPress={() => onPress(item)}
                      style={({ pressed }) => ({
                        opacity: readOnly ? 0.85 : pressed ? 0.7 : 1,
                        flexDirection: 'row',
                        alignItems: 'stretch',
                      })}
                    >
                      <View
                        style={{
                          width: ACCENT_BAR_W,
                          backgroundColor: barColor,
                          borderRadius: ACCENT_BAR_W / 2,
                          marginLeft: spacing.sm,
                          marginVertical: spacing.sm,
                        }}
                      />
                      <View
                        style={{
                          flex: 1,
                          paddingVertical: spacing.sm,
                          paddingLeft: spacing.sm,
                          paddingRight: spacing.md,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: fontFamily.generalSansMedium,
                            fontSize: 11,
                            lineHeight: 14,
                            letterSpacing: letterSpacing.label,
                            color: typeAccent,
                            marginBottom: 2,
                          }}
                        >
                          {kind}
                        </Text>
                        <Text
                          style={[typographyStyles.title, { color: colors.text.primary }]}
                          numberOfLines={2}
                        >
                          {item.title}
                        </Text>
                      </View>
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
