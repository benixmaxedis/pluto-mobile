import { View, Text } from 'react-native';
import { colors, fontSize, spacing, borderRadius, typographyStyles } from '@/lib/theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  /** `outline` = neutral bordered chip; `soft` = tinted fill */
  variant?: 'outline' | 'soft';
}

export function Badge({
  label,
  color = colors.text.secondary,
  size = 'sm',
  variant = 'outline',
}: BadgeProps) {
  const isSoft = variant === 'soft';
  const fontSizePx = size === 'sm' ? fontSize.xs : fontSize.sm;

  return (
    <View
      style={{
        backgroundColor: isSoft ? `${color}20` : colors.surfaceOverlay,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        paddingVertical: size === 'sm' ? spacing.hairline : spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: isSoft ? 0 : 1,
        borderColor: colors.borderStrong,
      }}
    >
      <Text
        style={{
          color: isSoft ? color : colors.text.secondary,
          fontSize: fontSizePx,
          fontFamily: typographyStyles.label.fontFamily,
          letterSpacing: typographyStyles.label.letterSpacing,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
