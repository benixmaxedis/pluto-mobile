import type { TextStyle, ViewStyle } from 'react-native';

/** Toggle temporary layout outlines on the Now header (greeting, week, date panel, chips) */
export const DEBUG_NOW_HEADER_BORDERS = false;

const outline = (color: string) =>
  ({ borderWidth: 2, borderStyle: 'solid' as const, borderColor: color }) satisfies ViewStyle & TextStyle;

export function dbgBorder(color: string): ViewStyle {
  if (!DEBUG_NOW_HEADER_BORDERS) return {};
  return outline(color);
}

/** Use on `<Text>` — same visuals as `dbgBorder` */
export function dbgTextBorder(color: string): TextStyle {
  if (!DEBUG_NOW_HEADER_BORDERS) return {};
  return outline(color);
}
