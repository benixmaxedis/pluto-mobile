import { View, Text } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/lib/theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = colors.actions.primary, size = 'sm' }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor: `${color}22`,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        paddingVertical: size === 'sm' ? 2 : spacing.xs,
        borderRadius: borderRadius.full,
      }}
    >
      <Text style={{ color, fontSize: size === 'sm' ? fontSize.xs : fontSize.sm, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
