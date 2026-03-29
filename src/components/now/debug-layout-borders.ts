import type { TextStyle, ViewStyle } from 'react-native';

/** Toggle temporary layout outlines on greeting, week strip, and chips */
export const DEBUG_NOW_HEADER_BORDERS = false;

/** Toggle temporary layout outlines on the date/times panel only */
export const DEBUG_DATE_PANEL_BORDERS = true;

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

export function dbgPanelBorder(color: string, enabled = DEBUG_DATE_PANEL_BORDERS): ViewStyle {
  if (!enabled) return {};
  return outline(color);
}

export function dbgPanelTextBorder(color: string, enabled = DEBUG_DATE_PANEL_BORDERS): TextStyle {
  if (!enabled) return {};
  return outline(color);
}
