import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
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
  const iconName = (CATEGORY_ICONS[category] ?? 'ellipsis-horizontal-circle-outline') as any;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 * opacity : opacity })}
    >
      <Card accentColor={colors.routines.primary}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {/* Category icon */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.md,
              backgroundColor: colors.routines.primary + '1A',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Ionicons name={iconName} size={18} color={colors.routines.primary} />
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
              {!isActive && <Badge label="Inactive" color={colors.text.secondary} size="sm" />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
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
        </View>
      </Card>
    </Pressable>
  );
}
