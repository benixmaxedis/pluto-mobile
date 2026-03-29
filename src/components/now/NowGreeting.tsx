import { View, Text } from 'react-native';
import { colors, fontFamily, spacing } from '@/lib/theme';
import { dbgBorder, dbgTextBorder } from '@/components/now/debug-layout-borders';
import { getNowGreetingLine } from '@/features/now/now-greeting';
import { NOW_USER_FIRST_NAME } from '@/features/now/constants';

/** Compact header — General Sans */
export function NowGreeting() {
  const line = getNowGreetingLine();
  const blue = colors.emphasis.primary;
  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xs,
        },
        dbgBorder('#06b6d4'),
      ]}
    >
      <Text
        style={[
          {
            fontFamily: fontFamily.generalSansSemibold,
            fontSize: 24,
            lineHeight: 30,
            letterSpacing: 0.5,
            color: blue,
          },
          dbgTextBorder('#22c55e'),
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {line}, {NOW_USER_FIRST_NAME}.
      </Text>
    </View>
  );
}
