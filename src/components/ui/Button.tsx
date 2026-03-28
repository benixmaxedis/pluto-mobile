import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { colors, borderRadius, spacing, fontSize, typographyStyles } from '@/lib/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  accentColor = colors.actions.primary,
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  const paddingY = size === 'sm' ? 6 : size === 'lg' ? spacing.sm : 8;
  const paddingX = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.xl : spacing.md;
  const textSize = size === 'sm' ? fontSize.sm : size === 'lg' ? fontSize.md : fontSize.base;

  return (
    <Pressable
      disabled={disabled || loading}
      style={(state) => [
        {
          backgroundColor: isPrimary ? accentColor : isGhost ? 'transparent' : colors.surface,
          paddingVertical: paddingY,
          paddingHorizontal: paddingX,
          borderRadius: borderRadius.md,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
          gap: spacing.sm,
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
          borderWidth: isGhost ? 0 : variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? colors.border : undefined,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? colors.background : colors.text.primary} />
      ) : (
        <Text
          style={{
            fontFamily: typographyStyles.button.fontFamily,
            fontSize: textSize,
            letterSpacing: typographyStyles.button.letterSpacing,
            lineHeight: size === 'sm' ? 16 : size === 'lg' ? 22 : 18,
            color: isPrimary ? colors.background : isGhost ? accentColor : colors.text.primary,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
