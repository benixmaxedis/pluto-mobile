import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize } from '@/lib/theme';

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
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isCompleted ? `${colors.success}22` : `${colors.capture.primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: fontSize.md }}>
              {isCompleted ? '\u2713' : '\u270E'}
            </Text>
          </View>
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
            <Text
              style={{
                fontSize: fontSize.sm,
                color: isCompleted ? colors.success : colors.text.muted,
                marginTop: 2,
              }}
            >
              {isCompleted ? 'Completed' : 'Not yet completed'}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize.md, color: colors.text.muted }}>{'\u203A'}</Text>
        </View>
      </Card>
    </Pressable>
  );
}
