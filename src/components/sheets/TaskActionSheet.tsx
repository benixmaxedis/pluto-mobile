import { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontFamily, letterSpacing } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import { isJournalQueueItem } from '@/features/queue/journal-queue';

export interface TaskActionSheetRef {
  present: (item: QueueItem) => void;
  dismiss: () => void;
}

interface Props {
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onMove: (id: string) => void;
  onEdit?: (item: QueueItem) => void;
  readOnly?: boolean;
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

type ActionDef = { key: string; label: string; color: string; onPress: () => void };

export const TaskActionSheet = forwardRef<TaskActionSheetRef, Props>(
  ({ onComplete, onSkip, onMove, onEdit, readOnly }, ref) => {
    const [visible, setVisible] = useState(false);
    const [item, setItem] = useState<QueueItem | null>(null);
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      present: (qi: QueueItem) => {
        setItem(qi);
        setVisible(true);
      },
      dismiss: () => setVisible(false),
    }), []);

    const close = useCallback(() => setVisible(false), []);

    if (!item) return null;

    const accent = getAccentColor(item);
    const kind = getKindLabel(item);
    const isJournal = isJournalQueueItem(item);

    const actions: ActionDef[] = [];

    // Complete is always available — users can retroactively mark past-session items done
    if (!isJournal) {
      actions.push({
        key: 'complete',
        label: 'Complete',
        color: accent,
        onPress: () => { close(); onComplete(item.id); },
      });
    } else if (!readOnly) {
      actions.push({
        key: 'complete',
        label: 'Open journal',
        color: accent,
        onPress: () => { close(); onComplete(item.id); },
      });
    }

    // Skip / Move / Edit only make sense for active sessions
    if (!readOnly && !isJournal) {
      actions.push({
        key: 'edit',
        label: 'Edit details',
        color: colors.text.secondary,
        onPress: () => { close(); onEdit?.(item); },
      });
      actions.push({
        key: 'skip',
        label: 'Skip',
        color: colors.text.secondary,
        onPress: () => { close(); onSkip(item.id); },
      });
      actions.push({
        key: 'move',
        label: 'Move to next session',
        color: colors.text.secondary,
        onPress: () => { close(); onMove(item.id); },
      });
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={close}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg + insets.bottom,
            paddingHorizontal: spacing.lg,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: borderRadius.full,
              }}
            />
          </View>

          {/* Title area */}
          <Text
            style={{
              fontFamily: fontFamily.generalSansMedium,
              fontSize: 12,
              lineHeight: 16,
              letterSpacing: letterSpacing.label,
              color: accent,
              marginBottom: 2,
            }}
          >
            {kind}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.generalSansSemibold,
              fontSize: 18,
              lineHeight: 24,
              color: colors.text.primary,
              marginBottom: spacing.lg,
            }}
          >
            {item.title}
          </Text>

          {/* Action buttons */}
          <View style={{ gap: spacing.sm }}>
            {actions.map((a, idx) => (
              <Pressable
                key={a.key}
                onPress={a.onPress}
                style={({ pressed }) => ({
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderRadius: borderRadius.lg,
                  backgroundColor: idx === 0 ? accent : colors.surfaceRaised,
                  opacity: pressed ? 0.8 : 1,
                  alignItems: 'center',
                })}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.generalSansMedium,
                    fontSize: 15,
                    lineHeight: 20,
                    color: idx === 0 ? colors.emphasis.onAccent : a.color,
                  }}
                >
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={close}
            style={({ pressed }) => ({
              paddingVertical: spacing.md,
              alignItems: 'center',
              opacity: pressed ? 0.6 : 1,
              marginTop: spacing.sm,
            })}
          >
            <Text
              style={{
                fontFamily: fontFamily.generalSansMedium,
                fontSize: 15,
                lineHeight: 20,
                color: colors.text.muted,
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  },
);

TaskActionSheet.displayName = 'TaskActionSheet';
