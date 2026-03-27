import { View, Text, Pressable } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, spacing, fontSize } from '@/lib/theme';

interface GuideItemCardProps {
  id: string;
  title: string;
  statement?: string | null;
  category: string;
  onPress?: (id: string) => void;
}

export function GuideItemCard({ id, title, statement, category, onPress }: GuideItemCardProps) {
  return (
    <Pressable onPress={() => onPress?.(id)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card accentColor={colors.guide.primary}>
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
              color={colors.guide.primary}
            />
          </View>
          {statement ? (
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.text.secondary,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {statement}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
