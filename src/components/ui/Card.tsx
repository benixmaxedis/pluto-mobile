import { View, type ViewProps } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '@/lib/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  accentColor?: string;
}

export function Card({ variant = 'default', accentColor, style, children, ...props }: CardProps) {
  const backgroundColor = variant === 'elevated' ? colors.surfaceElevated : colors.surface;
  const shadow = variant === 'elevated' ? shadows.md : shadows.sm;

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: accentColor ? `${accentColor}33` : colors.border,
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
