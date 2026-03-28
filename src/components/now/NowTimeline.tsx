import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typographyStyles, borderRadius, shadows } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import { isJournalQueueItem } from '@/features/queue/journal-queue';
import { FocusCard } from '@/components/cards/FocusCard';

type Props = {
  items: QueueItem[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onSnooze: (id: string) => void;
  onMove: (id: string) => void;
  readOnly?: boolean;
};

export function NowTimeline({
  items,
  expandedId,
  onToggleExpand,
  onComplete,
  onSkip,
  onSnooze,
  onMove,
  readOnly = false,
}: Props) {
  if (items.length === 0) {
    return (
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, marginTop: spacing.sm }}>
        <Text style={[typographyStyles.bodySmall, { color: colors.text.secondary, textAlign: 'center' }]}>
          Nothing scheduled for this view.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'], marginTop: spacing.sm }}>
      {items.map((item, index) => {
        const expanded = expandedId === item.id;
        const isLast = index === items.length - 1;
        const kind = isJournalQueueItem(item)
          ? 'Journal'
          : item.type === 'action'
            ? 'Action'
            : 'Routine';

        return (
          <View key={item.id} style={{ paddingBottom: isLast ? 0 : spacing.lg }}>
            {expanded ? (
              <FocusCard
                item={item}
                onComplete={onComplete}
                onSkip={onSkip}
                onSnooze={onSnooze}
                onMove={onMove}
              />
            ) : (
              <Pressable
                disabled={readOnly}
                onPress={() => onToggleExpand(item.id)}
                style={readOnly ? { opacity: 0.85 } : undefined}
              >
                <View
                  style={{
                    borderRadius: borderRadius.lg,
                    backgroundColor: colors.surfaceRaised,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    ...(shadows.sm as object),
                  }}
                >
                  <Text
                    style={[typographyStyles.caption, { color: colors.text.secondary, marginBottom: spacing.xs }]}
                  >
                    {kind}
                  </Text>
                  <Text style={[typographyStyles.title, { color: colors.text.primary }]} numberOfLines={3}>
                    {item.title}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}
