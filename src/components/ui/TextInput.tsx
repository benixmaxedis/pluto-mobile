import { TextInput as RNTextInput, View, Text, type TextInputProps as RNTextInputProps } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' }}>
          {label}
        </Text>
      )}
      <RNTextInput
        placeholderTextColor={colors.text.secondary}
        style={[
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            color: colors.text.primary,
            fontSize: fontSize.base,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={{ fontSize: fontSize.xs, color: colors.error }}>{error}</Text>
      )}
    </View>
  );
}
