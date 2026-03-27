import { View, Text, Pressable } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';

interface QueueItemCardProps {
  item: QueueItem;
  onPress?: (id: string) => void;
}

export function QueueItemCard({ item, onPress }: QueueItemCardProps) {
  const isAction = item.type === 'action';
  const accentColor = isAction ? colors.actions.primary : colors.routines.primary;
  const typeBadgeLabel = isAction ? 'Action' : 'Routine';

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {/* Priority dot */}
          {item.priority === 'high' && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: borderRadius.full,
                backgroundColor: colors.warning,
              }}
            />
          )}

          {/* Title */}
          <Text
            style={{
              flex: 1,
              fontSize: fontSize.base,
              fontWeight: '500',
              color: colors.text.primary,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Type badge */}
          <Badge label={typeBadgeLabel} color={accentColor} size="sm" />
        </View>
      </Card>
    </Pressable>
  );
}
