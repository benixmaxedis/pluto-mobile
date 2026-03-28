import { View, type ViewProps } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  accentColor?: string;
}

export function Card({ variant = 'default', accentColor, style, children, ...props }: CardProps) {
  const backgroundColor =
    variant === 'elevated' ? colors.surfaceElevated : colors.surfaceRaised;
  const shadow = variant === 'elevated' ? shadows.md : shadows.sm;

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: borderRadius.lg,
          padding: spacing.sm,
          borderWidth: 1,
          borderColor: accentColor ? `${accentColor}24` : colors.borderSubtle,
          ...(shadow as object),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
