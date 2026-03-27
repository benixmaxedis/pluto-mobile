import { View, Text } from 'react-native';
import { Card, Badge, Button } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';

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
  const isAction = item.type === 'action';
  const accentColor = isAction ? colors.actions.primary : colors.routines.primary;
  const typeBadgeLabel = isAction ? 'Action' : 'Routine';

  return (
    <Card variant="elevated" accentColor={accentColor}>
      <View style={{ gap: spacing.lg }}>
        {/* Header row: type badge + priority */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Badge label={typeBadgeLabel} color={accentColor} size="md" />
          {item.priority === 'high' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.warning,
                }}
              />
              <Text style={{ fontSize: fontSize.xs, color: colors.warning, fontWeight: '600' }}>
                High Priority
              </Text>
            </View>
          )}
          {item.isOverdue && (
            <Badge label="Overdue" color={colors.error} size="sm" />
          )}
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text.primary,
            lineHeight: 30,
          }}
        >
          {item.title}
        </Text>

        {/* Subtask progress */}
        {subtaskProgress && subtaskProgress.total > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: colors.border,
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
            <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '600' }}>
              {subtaskProgress.completed}/{subtaskProgress.total}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Complete"
              variant="primary"
              size="md"
              accentColor={accentColor}
              onPress={() => onComplete(item.id)}
            />
          </View>
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
        </View>
      </View>
    </Card>
  );
}
