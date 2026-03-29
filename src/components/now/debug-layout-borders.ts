import type { TextStyle, ViewStyle } from 'react-native';

/** Show floating “date panel borders” toggle on Now (above tab bar) */
export const DATE_PANEL_LAYOUT_DEBUG_UI = true;

/** Initial state for panel debug borders when the screen loads */
export const DEBUG_DATE_PANEL_BORDERS_INITIAL = true;

/** Thinner borders so layout isn’t eaten as much (still visible) */
const PANEL_BORDER_W = 1;

/** Toggle temporary layout outlines on greeting, week strip, and chips */
export const DEBUG_NOW_HEADER_BORDERS = false;

const outline = (color: string, width = 2) =>
  ({
    borderWidth: width,
    borderStyle: 'solid' as const,
    borderColor: color,
  }) satisfies ViewStyle & TextStyle;

export function dbgBorder(color: string): ViewStyle {
  if (!DEBUG_NOW_HEADER_BORDERS) return {};
  return outline(color, 2);
}

export function dbgTextBorder(color: string): TextStyle {
  if (!DEBUG_NOW_HEADER_BORDERS) return {};
  return outline(color, 2);
}

export function dbgPanelBorder(color: string, enabled: boolean): ViewStyle {
  if (!enabled) return {};
  return outline(color, PANEL_BORDER_W);
}

export function dbgPanelTextBorder(color: string, enabled: boolean): TextStyle {
  if (!enabled) return {};
  return outline(color, PANEL_BORDER_W);
}

/** @deprecated use DEBUG_DATE_PANEL_BORDERS_INITIAL */
export const DEBUG_DATE_PANEL_BORDERS = DEBUG_DATE_PANEL_BORDERS_INITIAL;
