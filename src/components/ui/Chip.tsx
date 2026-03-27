import { Pressable, Text } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/lib/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, selected, onPress, color = colors.actions.primary }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? `${color}22` : colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: selected ? color : colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: selected ? color : colors.text.secondary,
          fontSize: fontSize.sm,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
