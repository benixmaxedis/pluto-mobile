import type { TextStyle } from 'react-native';
import { colors } from './colors';
import { fontFamily, fontSize, letterSpacing, typographyStyles } from './typography';

/** Semantic screen chrome — use instead of one-off fontSize/color on tab roots. */
export const textStyles = {
  screenMeta: {
    fontFamily: fontFamily.generalSansRegular,
    fontSize: fontSize.sm,
    lineHeight: 18,
    letterSpacing: letterSpacing.body,
    color: colors.text.secondary,
  },
  screenTitle: {
    fontFamily: fontFamily.generalSansSemibold,
    fontSize: fontSize.xl,
    lineHeight: 30,
    letterSpacing: letterSpacing.heading,
    color: colors.text.primary,
  },
  screenTrailing: {
    fontFamily: fontFamily.generalSansRegular,
    fontSize: fontSize.sm,
    lineHeight: 18,
    letterSpacing: letterSpacing.body,
    color: colors.text.secondary,
  },
  sectionLabel: {
    ...typographyStyles.label,
    color: colors.text.secondary,
  },
} as const satisfies Record<string, TextStyle>;
