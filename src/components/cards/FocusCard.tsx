import { View, Text } from 'react-native';
import { Card, Badge, Button } from '@/components/ui';
import { borderRadius, colors, spacing, typographyStyles } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import { isJournalQueueItem } from '@/features/queue/journal-queue';

interface FocusCardProps {
  item: QueueItem;
  subtaskProgress?: { completed: number; total: number } | null;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onSnooze: (id: string) => void;
  onMove: (id: string) => void;
}

export function FocusCard({
  item,
  subtaskProgress,
  onComplete,
  onSkip,
  onSnooze,
  onMove,
}: FocusCardProps) {
  const isJournal = isJournalQueueItem(item);
  const isAction = item.type === 'action';
  const accentColor = isJournal
    ? colors.capture.primary
    : isAction
      ? colors.actions.primary
      : colors.routines.primary;
  const typeBadgeLabel = isJournal ? 'Journal' : isAction ? 'Action' : 'Routine';

  return (
    <Card variant="elevated">
      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typographyStyles.label, { color: colors.text.secondary }]}>{typeBadgeLabel}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            {item.priority === 'high' && (
              <Badge label="High priority" color={colors.warning} size="sm" variant="soft" />
            )}
            {item.isOverdue && (
              <Badge label="Overdue" color={colors.error} size="sm" variant="soft" />
            )}
          </View>
        </View>

        <Text style={[typographyStyles.heading1, { color: colors.text.primary }]}>{item.title}</Text>

        {subtaskProgress && subtaskProgress.total > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: colors.borderSubtle,
                borderRadius: borderRadius.full,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${(subtaskProgress.completed / subtaskProgress.total) * 100}%`,
                  height: '100%',
                  backgroundColor: accentColor,
                  borderRadius: borderRadius.full,
                }}
              />
            </View>
            <Text style={[typographyStyles.caption, { color: colors.text.secondary }]}>
              {subtaskProgress.completed}/{subtaskProgress.total}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <Button
              title={isJournal ? 'Open journal' : 'Complete'}
              variant="primary"
              size="md"
              accentColor={accentColor}
              onPress={() => onComplete(item.id)}
            />
          </View>
          {!isJournal && (
            <>
              <Button
                title="Skip"
                variant="ghost"
                size="sm"
                accentColor={colors.text.secondary}
                onPress={() => onSkip(item.id)}
              />
              <Button
                title="Snooze"
                variant="ghost"
                size="sm"
                accentColor={colors.text.secondary}
                onPress={() => onSnooze(item.id)}
              />
              <Button
                title="Move"
                variant="ghost"
                size="sm"
                accentColor={colors.text.secondary}
                onPress={() => onMove(item.id)}
              />
            </>
          )}
        </View>
      </View>
    </Card>
  );
}
