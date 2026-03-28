import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import type { QueueItem } from '@/features/queue/engine/queue-builder';
import { isJournalQueueItem } from '@/features/queue/journal-queue';

const STATUS_DOT = 10;

interface QueueItemCardProps {
  item: QueueItem;
  /** Filled dot vs outline (pending). */
  completed?: boolean;
  onPress?: (id: string) => void;
}

export function QueueItemCard({ item, completed = false, onPress }: QueueItemCardProps) {
  const isJournal = isJournalQueueItem(item);
  const isAction = item.type === 'action';
  const accentColor = isJournal
    ? colors.capture.primary
    : isAction
      ? colors.actions.primary
      : colors.routines.primary;

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card
        style={{
          paddingVertical: spacing.xs + spacing.hairline,
          paddingHorizontal: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: STATUS_DOT,
              height: STATUS_DOT,
              borderRadius: borderRadius.full,
              backgroundColor: completed ? accentColor : 'transparent',
              borderWidth: completed ? 0 : 1.5,
              borderColor: accentColor,
            }}
          />
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
        </View>
      </Card>
    </Pressable>
  );
}
