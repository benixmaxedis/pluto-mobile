import type { TextStyle } from 'react-native';

/**
 * General Sans — UI sans (400 / 500 / 600).
 * Michroma — reserved for Now panel stacked date + session times only (see NowDateEventsPanel).
 */

export const fontFamily = {
  michroma: 'Michroma_400Regular',
  generalSansRegular: 'GeneralSans_400Regular',
  generalSansMedium: 'GeneralSans_500Medium',
  generalSansSemibold: 'GeneralSans_600Semibold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
} as const;

export const lineHeight = {
  displayTight: 1.05,
  relaxed: 1.45,
  snug: 1.35,
} as const;

export const letterSpacing = {
  /** Headings (H1/H2) */
  heading: 0.3,
  /** Large display numerals */
  displayTight: -1.2,
  /** Labels, uppercase rails */
  label: 0.45,
  /** Buttons, compact UI chrome */
  control: 0.45,
  /** Body */
  body: 0.15,
} as const;

export const typographyStyles = {
  displayXL: {
    fontFamily: fontFamily.generalSansMedium,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: letterSpacing.displayTight,
  },
  displayLarge: {
    fontFamily: fontFamily.generalSansMedium,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: letterSpacing.displayTight,
  },
  heading1: {
    fontFamily: fontFamily.generalSansSemibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: letterSpacing.heading,
  },
  heading2: {
    fontFamily: fontFamily.generalSansSemibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: letterSpacing.heading,
  },
  title: {
    fontFamily: fontFamily.generalSansSemibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: letterSpacing.heading,
  },
  body: {
    fontFamily: fontFamily.generalSansRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: letterSpacing.body,
  },
  bodySmall: {
    fontFamily: fontFamily.generalSansRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: letterSpacing.body,
  },
  label: {
    fontFamily: fontFamily.generalSansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  caption: {
    fontFamily: fontFamily.generalSansRegular,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: fontFamily.generalSansMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: letterSpacing.control,
  },
} as const satisfies Record<string, TextStyle>;
