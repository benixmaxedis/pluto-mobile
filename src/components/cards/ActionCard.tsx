import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const iconName = priority === 'high' ? 'flash-outline' : 'checkmark-circle-outline';
  const iconColor = priority === 'high' ? colors.warning : colors.actions.primary;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card accentColor={colors.actions.primary}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {/* Type / priority icon */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.md,
              backgroundColor: iconColor + '1A',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Ionicons name={iconName as any} size={18} color={iconColor} />
          </View>

          {/* Content */}
          <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
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
                <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
                  {subtaskProgress.completed}/{subtaskProgress.total} subtasks
                </Text>
              )}
              {status !== 'pending' && (
                <Badge
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  color={status === 'completed' ? colors.success : colors.text.secondary}
                  size="sm"
                />
              )}
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
