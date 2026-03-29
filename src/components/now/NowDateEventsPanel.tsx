import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, letterSpacing, spacing } from '@/lib/theme';
import {
  getFullDayWindowLabels,
  getSessionWindowLabels,
} from '@/features/now/session-time-format';
import type { NowSessionFilter } from '@/features/now/use-now-queues';
import { PanelDebugOutline } from '@/components/now/debug-panel-outline';

type Props = {
  dateIso: string;
  sessionFilter: NowSessionFilter;
  /** Controlled from Now screen (floating toggle). Default off elsewhere. */
  panelLayoutBorders?: boolean;
};

const DATE_DAY = 70;
const DATE_DAY_LH = 72;
const DATE_MONTH = 48;
const DATE_MONTH_LH = 50;
const MONTH_PULL_UP = -10;

const WEEKDAY_SIZE = 15;
const WEEKDAY_LH = 19;

const RAIL_W = 14;
const NODE = 8;
const LINE_W = 2;

const eventMetaLabel = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: 13,
  lineHeight: 17,
  letterSpacing: letterSpacing.label,
  color: colors.text.secondary,
} as const;

export function NowDateEventsPanel({ dateIso, sessionFilter, panelLayoutBorders = false }: Props) {
  const [dayIntrinsicW, setDayIntrinsicW] = useState(0);
  const [monthIntrinsicW, setMonthIntrinsicW] = useState(0);
  const dateBlockW =
    dayIntrinsicW > 0 && monthIntrinsicW > 0
      ? Math.max(dayIntrinsicW, monthIntrinsicW)
      : undefined;

  const rightColumnRef = useRef<View>(null);
  const fromTimeWrapRef = useRef<View>(null);
  const toTimeWrapRef = useRef<View>(null);
  const [timeCentersY, setTimeCentersY] = useState<{ from: number; to: number } | null>(null);

  const measureTimeCenters = useCallback(() => {
    const host = rightColumnRef.current;
    const fromW = fromTimeWrapRef.current;
    const toW = toTimeWrapRef.current;
    if (!host || !fromW || !toW) return;

    let fromMid: number | null = null;
    let toMid: number | null = null;
    const commit = () => {
      if (fromMid != null && toMid != null) setTimeCentersY({ from: fromMid, to: toMid });
    };

    fromW.measureLayout(host, (_x, y, _w, h) => { fromMid = y + h / 2; commit(); }, () => {});
    toW.measureLayout(host, (_x, y, _w, h) => { toMid = y + h / 2; commit(); }, () => {});
  }, []);

  useEffect(() => {
    setDayIntrinsicW(0);
    setMonthIntrinsicW(0);
    setTimeCentersY(null);
  }, [dateIso]);

  const sessionWindow =
    sessionFilter === 'all'
      ? getFullDayWindowLabels()
      : getSessionWindowLabels(sessionFilter);

  const sessionWindowKey = `${sessionFilter}:${sessionWindow.from}|${sessionWindow.to}`;
  useEffect(() => { setTimeCentersY(null); }, [sessionWindowKey]);

  const blue = colors.emphasis.primary;
  const b = panelLayoutBorders;

  const timeTextStyle = {
    fontFamily: fontFamily.michroma,
    fontSize: DATE_MONTH,
    lineHeight: DATE_MONTH_LH,
    letterSpacing: letterSpacing.displayTight,
    color: blue,
  } as const;

  const d = parseISO(dateIso + 'T12:00:00');
  const weekday = format(d, 'EEEE');
  const dayNum = format(d, 'd');
  const month = format(d, 'MMM');

  return (
    <PanelDebugOutline
      color="#ec4899"
      enabled={b}
      style={{ paddingHorizontal: spacing.lg }}
    >
      {/* Two-column row */}
      <PanelDebugOutline
        color="#8b5cf6"
        enabled={b}
        style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs }}
      >
        {/* Left: day + date stack — takes all remaining space */}
        <PanelDebugOutline
          color="#ef4444"
          enabled={b}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
          }}
        >
          <PanelDebugOutline color="#fbbf24" enabled={b} style={{ alignSelf: 'flex-start' }}>
            <Text
              style={{
                fontFamily: fontFamily.generalSansMedium,
                fontSize: WEEKDAY_SIZE,
                lineHeight: WEEKDAY_LH,
                letterSpacing: letterSpacing.label,
                color: blue,
              }}
              numberOfLines={1}
            >
              {weekday}
            </Text>
          </PanelDebugOutline>

          {/* Date block — self-measured to align day/month widths */}
          <PanelDebugOutline color="#34d399" enabled={b} style={{ alignSelf: 'flex-start', width: dateBlockW }}>
            <PanelDebugOutline color="#10b981" enabled={b}>
              <Text
                onLayout={(e: LayoutChangeEvent) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setDayIntrinsicW((prev) => (prev === w ? prev : w));
                }}
                style={{
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_DAY,
                  lineHeight: DATE_DAY_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  textAlign: 'center',
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
                  if (w > 0) setMonthIntrinsicW((prev) => (prev === w ? prev : w));
                }}
                style={{
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_MONTH,
                  lineHeight: DATE_MONTH_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  marginTop: MONTH_PULL_UP,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {month}
              </Text>
            </PanelDebugOutline>
          </PanelDebugOutline>
        </PanelDebugOutline>

        {/* Right: rail + times — fixed basis so it never competes with left */}
        <View
          ref={rightColumnRef}
          style={{
            flexShrink: 0,
            flexGrow: 0,
            flexBasis: '46%',
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
          onLayout={() => requestAnimationFrame(measureTimeCenters)}
        >
          {/* Vertical rail — stretches to match times column / row height */}
          <View
            style={{
              width: RAIL_W,
              marginRight: spacing.sm,
              position: 'relative',
            }}
          >
            {timeCentersY != null &&
              (() => {
                const y1 = timeCentersY.from;
                const y2 = timeCentersY.to;
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

          {/* Times column */}
          <PanelDebugOutline
            color="#f472b6"
            enabled={b}
            style={{
              flex: 1,
              minWidth: 0,
              justifyContent: 'flex-start',
            }}
          >
            <PanelDebugOutline color="#fde047" enabled={b}>
              <Text style={eventMetaLabel}>Events from</Text>
            </PanelDebugOutline>
            <View ref={fromTimeWrapRef} collapsable={false}>
              <PanelDebugOutline color="#2dd4bf" enabled={b}>
                <Text
                  style={timeTextStyle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  onLayout={() => requestAnimationFrame(measureTimeCenters)}
                >
                  {sessionWindow.from}
                </Text>
              </PanelDebugOutline>
            </View>
            <PanelDebugOutline color="#c084fc" enabled={b} style={{ alignItems: 'flex-start' }}>
              <Text style={eventMetaLabel}>to</Text>
            </PanelDebugOutline>
            <View ref={toTimeWrapRef} collapsable={false}>
              <PanelDebugOutline color="#38bdf8" enabled={b}>
                <Text
                  style={timeTextStyle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  onLayout={() => requestAnimationFrame(measureTimeCenters)}
                >
                  {sessionWindow.to}
                </Text>
              </PanelDebugOutline>
            </View>
          </PanelDebugOutline>
        </View>
      </PanelDebugOutline>
    </PanelDebugOutline>
  );
}
