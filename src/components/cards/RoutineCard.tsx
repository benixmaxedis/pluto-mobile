import { View, Text, Pressable } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize } from '@/lib/theme';
import { getSessionLabel } from '@/lib/constants/sessions';
import type { Session, RecurrenceType } from '@/lib/constants';

interface RoutineCardProps {
  id: string;
  title: string;
  category: string;
  defaultSession?: Session | null;
  recurrenceType: RecurrenceType;
  recurrenceDaysJson?: string | null;
  isActive: boolean;
  onPress?: (id: string) => void;
}

function formatRecurrenceSummary(
  recurrenceType: RecurrenceType,
  recurrenceDaysJson?: string | null,
): string {
  const typeLabels: Record<string, string> = {
    weekly: 'Weekly',
    fortnightly: 'Every 2 weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annually: 'Annually',
  };

  const base = typeLabels[recurrenceType] ?? recurrenceType;

  if (recurrenceType === 'weekly' && recurrenceDaysJson) {
    try {
      const days: string[] = JSON.parse(recurrenceDaysJson);
      if (days.length > 0 && days.length < 7) {
        const abbreviated = days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3));
        return abbreviated.join(', ');
      }
      if (days.length === 7) return 'Every day';
    } catch {
      // Fall through to base label
    }
  }

  return base;
}

function formatCategoryLabel(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function RoutineCard({
  id,
  title,
  category,
  defaultSession,
  recurrenceType,
  recurrenceDaysJson,
  isActive,
  onPress,
}: RoutineCardProps) {
  const opacity = isActive ? 1 : 0.5;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 * opacity : opacity })}
    >
      <Card accentColor={colors.routines.primary}>
        <View style={{ gap: spacing.sm }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
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
            {!isActive && <Badge label="Inactive" color={colors.text.secondary} size="sm" />}
          </View>

          {/* Meta row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Badge
              label={formatCategoryLabel(category)}
              color={colors.routines.primary}
              size="sm"
            />
            {defaultSession && (
              <Badge
                label={getSessionLabel(defaultSession)}
                color={colors.routines.secondary}
                size="sm"
              />
            )}
            <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary }}>
              {formatRecurrenceSummary(recurrenceType, recurrenceDaysJson)}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
