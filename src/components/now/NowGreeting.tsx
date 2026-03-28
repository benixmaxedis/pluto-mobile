import { View, Text } from 'react-native';
import { colors, fontFamily, spacing } from '@/lib/theme';
import { getNowGreetingLine } from '@/features/now/now-greeting';
import { NOW_USER_FIRST_NAME } from '@/features/now/constants';

/** Compact header — Michroma for display heading */
export function NowGreeting() {
  const line = getNowGreetingLine();
  const blue = colors.emphasis.primary;
  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.michroma,
          fontSize: 21,
          lineHeight: 26,
          letterSpacing: 0.5,
          color: blue,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {line}, {NOW_USER_FIRST_NAME}
      </Text>
    </View>
  );
}
