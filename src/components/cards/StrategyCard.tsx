import { View, Text, Pressable } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize } from '@/lib/theme';

interface StrategyCardProps {
  id: string;
  title: string;
  triggerText?: string | null;
  category: string;
  onPress?: (id: string) => void;
}

export function StrategyCard({ id, title, triggerText, category, onPress }: StrategyCardProps) {
  return (
    <Pressable onPress={() => onPress?.(id)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card accentColor={colors.strategies.primary}>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text
              style={{
                flex: 1,
                fontSize: fontSize.base,
                fontWeight: '600',
                color: colors.text.primary,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Badge
              label={category.replace('_', ' ')}
              color={colors.strategies.primary}
            />
          </View>
          {triggerText ? (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {triggerText}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
