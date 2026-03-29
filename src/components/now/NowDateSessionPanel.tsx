import { useCallback, useRef, useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, letterSpacing, spacing } from '@/lib/theme';
import {
  getFullDayWindowLabels,
  getSessionWindowLabels,
} from '@/features/now/session-time-format';
import type { NowSessionFilter } from '@/features/now/use-now-queues';
import { PanelDebugOutline } from '@/components/now/debug-panel-outline';
import { useDatePanelLayoutDebug } from '@/components/now/date-panel-layout-debug-context';

type Props = {
  dateIso: string;
  sessionFilter: NowSessionFilter;
};

const DATE_DAY_SIZE = 72;
const DATE_DAY_LH = 76;
const DATE_MONTH_SIZE = 48;
const DATE_MONTH_LH = 48;

const TIME_SIZE = 22;
const TIME_LH = 26;

const HEADING_SIZE = 15;
const HEADING_LH = 19;

/** Negative margin on day pulls month closer; account for it in total height. */
const DAY_PULL = -12;
const DATE_BLOCK_H = DATE_DAY_LH + DAY_PULL + DATE_MONTH_LH;

const RAIL_W = 14;
const RAIL_MARGIN_RIGHT = 10;
const NODE = 8;
const LINE_W = 2;

const blue = colors.emphasis.primary;

const headingStyle = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: HEADING_SIZE,
  lineHeight: HEADING_LH,
  letterSpacing: letterSpacing.label,
  color: blue,
} as const;

const timeStyle = {
  fontFamily: fontFamily.michroma,
  fontSize: TIME_SIZE,
  lineHeight: TIME_LH,
  letterSpacing: letterSpacing.displayTight,
  color: blue,
} as const;

const toStyle = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: 13,
  lineHeight: 17,
  letterSpacing: letterSpacing.label,
  color: colors.text.secondary,
} as const;

export function NowDateSessionPanel({ dateIso, sessionFilter }: Props) {
  const { panelLayoutBorders: b } = useDatePanelLayoutDebug();

  const [dayW, setDayW] = useState(0);
  const [monthW, setMonthW] = useState(0);
  const sharedW = dayW > 0 && monthW > 0 ? Math.max(dayW, monthW) : undefined;

  const timesAreaRef = useRef<View>(null);
  const railColumnRef = useRef<View>(null);
  const fromTimeRef = useRef<Text | null>(null);
  const toTimeRef = useRef<Text | null>(null);
  const [railY, setRailY] = useState<{ from: number; to: number } | null>(null);

  const measureRail = useCallback(() => {
    const area = timesAreaRef.current;
    const railCol = railColumnRef.current;
    const fromT = fromTimeRef.current;
    const toT = toTimeRef.current;
    if (!area || !railCol || !fromT || !toT) return;

    let railColTop = 0;
    let fromMid: number | null = null;
    let toMid: number | null = null;
    const commit = () => {
      if (fromMid != null && toMid != null) {
        setRailY({ from: fromMid - railColTop, to: toMid - railColTop });
      }
    };

    railCol.measureLayout(area, (_x, y) => { railColTop = y; }, () => {});
    fromT.measureLayout(area, (_x, y, _w, h) => { fromMid = y + h / 2; commit(); }, () => {});
    toT.measureLayout(area, (_x, y, _w, h) => { toMid = y + h / 2; commit(); }, () => {});
  }, []);

  const onTimesLayout = useCallback(() => {
    requestAnimationFrame(measureRail);
  }, [measureRail]);

  const sessionWindow =
    sessionFilter === 'all'
      ? getFullDayWindowLabels()
      : getSessionWindowLabels(sessionFilter);

  const d = parseISO(dateIso + 'T12:00:00');
  const weekday = format(d, 'EEEE');
  const dayNum = format(d, 'd');
  const month = format(d, 'MMM');

  const fromLabel = sessionWindow.from.toUpperCase();
  const toLabel = sessionWindow.to.toUpperCase();

  return (
    <PanelDebugOutline color="#ec4899" enabled={b} style={{ paddingHorizontal: spacing.lg }}>
      {/* Main two-column row */}
      <PanelDebugOutline
        color="#8b5cf6"
        enabled={b}
        style={{ flexDirection: 'row', alignItems: 'flex-start' }}
      >
        {/* Left column */}
        <PanelDebugOutline
          color="#ef4444"
          enabled={b}
          style={{ flexGrow: 0, flexShrink: 0, flexBasis: '45%' }}
        >
          <PanelDebugOutline color="#fbbf24" enabled={b} style={{ alignSelf: 'flex-start' }}>
            <Text style={headingStyle} numberOfLines={1}>
              {weekday}
            </Text>
          </PanelDebugOutline>

          <PanelDebugOutline
            color="#34d399"
            enabled={b}
            style={{
              alignSelf: 'flex-start',
              marginTop: spacing.xs,
              width: sharedW,
              alignItems: 'center',
            }}
          >
            <PanelDebugOutline color="#10b981" enabled={b}>
              <Text
                onLayout={(e: LayoutChangeEvent) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setDayW((prev) => (prev === w ? prev : w));
                }}
                style={{
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_DAY_SIZE,
                  lineHeight: DATE_DAY_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  textAlign: 'center',
                  marginBottom: DAY_PULL,
                }}
                numberOfLines={1}
              >
                {dayNum}
              </Text>
            </PanelDebugOutline>
            <PanelDebugOutline color="#059669" enabled={b}>
              <Text
                onLayout={(e: LayoutChangeEvent) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setMonthW((prev) => (prev === w ? prev : w));
                }}
                style={{
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_MONTH_SIZE,
                  lineHeight: DATE_MONTH_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {month}
              </Text>
            </PanelDebugOutline>
          </PanelDebugOutline>
        </PanelDebugOutline>

        {/* Right column */}
        <PanelDebugOutline
          color="#f472b6"
          enabled={b}
          style={{ flexGrow: 0, flexShrink: 0, flexBasis: '55%' }}
        >
          <PanelDebugOutline color="#fde047" enabled={b} style={{ alignSelf: 'flex-start' }}>
            <Text style={headingStyle} numberOfLines={1}>
              Events from
            </Text>
          </PanelDebugOutline>

          {/* Times area */}
          <PanelDebugOutline
            color="#38bdf8"
            enabled={b}
            style={{
              height: DATE_BLOCK_H,
              flexDirection: 'row',
              alignItems: 'stretch',
              marginTop: spacing.xs,
            }}
          >
            <View
              ref={timesAreaRef}
              collapsable={false}
              onLayout={onTimesLayout}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'stretch' }}
            >
              {/* Vertical rail */}
              <View
                ref={railColumnRef}
                collapsable={false}
                style={{
                  width: RAIL_W,
                  marginRight: RAIL_MARGIN_RIGHT,
                  position: 'relative',
                }}
              >
                {railY != null && (() => {
                  const y1 = railY.from;
                  const y2 = railY.to;
                  const lineTop = Math.min(y1, y2);
                  const lineH = Math.max(Math.abs(y2 - y1), 1);
                  return (
                    <>
                      <View
                        style={{
                          position: 'absolute',
                          left: (RAIL_W - NODE) / 2,
                          top: y1 - NODE / 2,
                          width: NODE,
                          height: NODE,
                          borderRadius: NODE / 2,
                          borderWidth: 2,
                          borderColor: blue,
                          backgroundColor: 'transparent',
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          left: (RAIL_W - LINE_W) / 2,
                          top: lineTop,
                          width: LINE_W,
                          height: lineH,
                          backgroundColor: blue,
                          opacity: 0.9,
                          borderRadius: 1,
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          left: (RAIL_W - NODE) / 2,
                          top: y2 - NODE / 2,
                          width: NODE,
                          height: NODE,
                          borderRadius: NODE / 2,
                          backgroundColor: blue,
                        }}
                      />
                    </>
                  );
                })()}
              </View>

              {/* Times stack */}
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <PanelDebugOutline color="#2dd4bf" enabled={b}>
                  <Text
                    ref={fromTimeRef}
                    style={timeStyle}
                    numberOfLines={1}
                    onLayout={onTimesLayout}
                  >
                    {fromLabel}
                  </Text>
                </PanelDebugOutline>

                <PanelDebugOutline color="#c084fc" enabled={b} style={{ alignSelf: 'flex-start' }}>
                  <Text style={toStyle}>to</Text>
                </PanelDebugOutline>

                <PanelDebugOutline color="#2dd4bf" enabled={b}>
                  <Text
                    ref={toTimeRef}
                    style={timeStyle}
                    numberOfLines={1}
                    onLayout={onTimesLayout}
                  >
                    {toLabel}
                  </Text>
                </PanelDebugOutline>
              </View>
            </View>
          </PanelDebugOutline>
        </PanelDebugOutline>
      </PanelDebugOutline>
    </PanelDebugOutline>
  );
}
