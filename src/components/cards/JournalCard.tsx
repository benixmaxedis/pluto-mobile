import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

const STATUS_DOT = 12;

interface JournalCardProps {
  type: 'morning' | 'evening';
  isCompleted: boolean;
  onPress?: () => void;
}

export function JournalCard({ type, isCompleted, onPress }: JournalCardProps) {
  const label = type === 'morning' ? 'Morning Journal' : 'Evening Journal';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card accentColor={colors.capture.primary}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: STATUS_DOT,
              height: STATUS_DOT,
              borderRadius: borderRadius.full,
              backgroundColor: isCompleted ? colors.success : 'transparent',
              borderWidth: isCompleted ? 0 : 1.5,
              borderColor: colors.border,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fontSize.base,
                fontWeight: '600',
                color: colors.text.primary,
              }}
            >
              {label}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize.md, color: colors.text.secondary }}>{'\u203A'}</Text>
        </View>
      </Card>
    </Pressable>
  );
}
