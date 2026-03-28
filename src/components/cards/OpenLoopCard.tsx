import { View, Text, Pressable } from 'react-native';
import { Card, Badge, Button } from '@/components/ui';
import { colors, spacing, fontSize } from '@/lib/theme';

interface OpenLoopCardProps {
  id: string;
  title: string;
  category?: string | null;
  onConvert?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function OpenLoopCard({ id, title, category, onConvert, onArchive }: OpenLoopCardProps) {
  return (
    <Card accentColor={colors.capture.primary}>
      <View style={{ gap: spacing.sm }}>
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
          {category && (
            <Badge
              label={category.replace('_', ' ')}
              color={colors.capture.primary}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
          {onArchive && (
            <Button
              title="Archive"
              variant="ghost"
              size="sm"
              accentColor={colors.text.secondary}
              onPress={() => onArchive(id)}
            />
          )}
          {onConvert && (
            <Button
              title="Convert"
              variant="secondary"
              size="sm"
              accentColor={colors.capture.primary}
              onPress={() => onConvert(id)}
            />
          )}
        </View>
      </View>
    </Card>
  );
}
