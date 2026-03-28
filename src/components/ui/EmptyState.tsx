import { View, Text } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  accentColor = colors.actions.primary,
}: EmptyStateProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        gap: spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: fontSize.base,
          color: colors.text.secondary,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} variant="secondary" size="sm" accentColor={accentColor} onPress={onAction} />
      )}
    </View>
  );
}
