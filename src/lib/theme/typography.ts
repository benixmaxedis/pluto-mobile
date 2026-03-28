import type { TextStyle } from 'react-native';

/**
 * Plus Jakarta Sans — wide geometric sans (not condensed).
 * - Headings: 600, slight positive tracking (0.2–0.4).
 * - Large numerals: 500, negative tracking (~−1 to −1.5).
 * - Labels / buttons: 500, tracking 0.3–0.6.
 */

export const fontFamily = {
  michroma: 'Michroma_400Regular',
  jakartaRegular: 'PlusJakartaSans_400Regular',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaSemibold: 'PlusJakartaSans_600SemiBold',
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
    fontFamily: fontFamily.jakartaMedium,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: letterSpacing.displayTight,
  },
  displayLarge: {
    fontFamily: fontFamily.jakartaMedium,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: letterSpacing.displayTight,
  },
  heading1: {
    fontFamily: fontFamily.jakartaSemibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: letterSpacing.heading,
  },
  heading2: {
    fontFamily: fontFamily.jakartaSemibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: letterSpacing.heading,
  },
  title: {
    fontFamily: fontFamily.jakartaSemibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: letterSpacing.heading,
  },
  body: {
    fontFamily: fontFamily.jakartaRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: letterSpacing.body,
  },
  bodySmall: {
    fontFamily: fontFamily.jakartaRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: letterSpacing.body,
  },
  label: {
    fontFamily: fontFamily.jakartaMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  caption: {
    fontFamily: fontFamily.jakartaRegular,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: fontFamily.jakartaMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: letterSpacing.control,
  },
} as const satisfies Record<string, TextStyle>;
