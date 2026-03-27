import { View, Text, Pressable } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { formatDisplayDate } from '@/lib/utils/date';
import { getSessionLabel } from '@/lib/constants/sessions';
import type { Session } from '@/lib/constants';

interface ActionCardProps {
  id: string;
  title: string;
  scheduledDate?: string | null;
  effectiveDate?: string | null;
  scheduledSession?: Session | null;
  effectiveSession?: Session | null;
  priority?: 'normal' | 'high';
  status?: string;
  subtaskProgress?: { completed: number; total: number } | null;
  isOverdue?: boolean;
  onPress?: (id: string) => void;
}

export function ActionCard({
  id,
  title,
  scheduledDate,
  effectiveDate,
  scheduledSession,
  effectiveSession,
  priority = 'normal',
  status = 'pending',
  subtaskProgress,
  isOverdue = false,
  onPress,
}: ActionCardProps) {
  const displayDate = effectiveDate ?? scheduledDate;
  const displaySession = effectiveSession ?? scheduledSession;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card accentColor={colors.actions.primary}>
        <View style={{ gap: spacing.sm }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {/* Priority indicator */}
            {priority === 'high' && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.warning,
                }}
              />
            )}

            <Text
              style={{
                flex: 1,
                fontSize: fontSize.base,
                fontWeight: '600',
                color: colors.text.primary,
              }}
              numberOfLines={2}
            >
              {title}
            </Text>

            {isOverdue && <Badge label="Overdue" color={colors.error} size="sm" />}
          </View>

          {/* Meta row: date, session, subtask count */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            {displayDate && (
              <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
                {formatDisplayDate(displayDate)}
              </Text>
            )}
            {displaySession && (
              <Badge
                label={getSessionLabel(displaySession)}
                color={colors.actions.primary}
                size="sm"
              />
            )}
            {subtaskProgress && subtaskProgress.total > 0 && (
              <Text style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
                {subtaskProgress.completed}/{subtaskProgress.total} subtasks
              </Text>
            )}
            {status !== 'pending' && (
              <Badge
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                color={status === 'completed' ? colors.success : colors.text.muted}
                size="sm"
              />
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
