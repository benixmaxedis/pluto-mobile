import type { ViewStyle, TextStyle } from 'react-native';

/** Master switch — set to true to see borders on the greeting/week/chips header */
export const DEBUG_NOW_HEADER_BORDERS = false;

/** Master switch — set to true to see borders inside the date/session panel */
export const DEBUG_DATE_PANEL_BORDERS = false;

export function dbgPanelBorder(color: string, enabled = DEBUG_DATE_PANEL_BORDERS): ViewStyle {
  if (!enabled) return {};
  return { borderWidth: 2, borderStyle: 'solid', borderColor: color };
}

export function dbgPanelTextBorder(color: string, enabled = DEBUG_DATE_PANEL_BORDERS): TextStyle {
  if (!enabled) return {};
  return { borderWidth: 1, borderStyle: 'solid', borderColor: color };
}
