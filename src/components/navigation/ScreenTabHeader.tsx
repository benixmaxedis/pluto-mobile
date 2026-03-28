import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, textStyles } from '@/lib/theme';

export type ScreenTabHeaderProps = {
  title: string;
  trailing?: ReactNode;
  onBackPress?: () => void;
  children?: ReactNode;
};

export function ScreenTabHeader({
  title,
  trailing,
  onBackPress,
  children,
}: ScreenTabHeaderProps) {
  return (
    <View
      style={{
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
    >
      {onBackPress ? (
        <Pressable
          onPress={onBackPress}
          hitSlop={12}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            alignSelf: 'flex-start',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
          <Text style={[textStyles.screenMeta, { fontWeight: '500' }]}>Back</Text>
        </Pressable>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={[textStyles.screenTitle, { flex: 1, marginRight: trailing ? spacing.sm : 0 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {trailing != null && trailing !== false ? (
          typeof trailing === 'string' || typeof trailing === 'number' ? (
            <Text style={textStyles.screenTrailing} numberOfLines={1}>
              {trailing}
            </Text>
          ) : (
            trailing
          )
        ) : null}
      </View>

      {children}
    </View>
  );
}
