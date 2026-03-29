import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Switch, type LayoutChangeEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, letterSpacing, spacing } from '@/lib/theme';
import {
  getFullDayWindowLabels,
  getSessionWindowLabels,
} from '@/features/now/session-time-format';
import type { NowSessionFilter } from '@/features/now/use-now-queues';
import {
  DEBUG_DATE_PANEL_BORDERS,
  dbgPanelBorder,
  dbgPanelTextBorder,
} from '@/components/now/debug-layout-borders';

type Props = {
  dateIso: string;
  sessionFilter: NowSessionFilter;
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

const DATE_PANEL_COLUMN_H = 150;

const eventMetaLabel = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: 13,
  lineHeight: 17,
  letterSpacing: letterSpacing.label,
  color: colors.text.secondary,
} as const;

export function NowDateEventsPanel({ dateIso, sessionFilter }: Props) {
  const [showBorders, setShowBorders] = useState(DEBUG_DATE_PANEL_BORDERS);

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
  const b = showBorders;

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
    <View
      style={[
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, marginBottom: spacing.xs },
        dbgPanelBorder('#ec4899', b),
      ]}
    >
      {/* Debug toggle */}
      {DEBUG_DATE_PANEL_BORDERS && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: spacing.xs,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.text.muted }}>borders</Text>
          <Switch
            value={showBorders}
            onValueChange={setShowBorders}
            trackColor={{ false: colors.border, true: colors.emphasis.primary + '66' }}
            thumbColor={showBorders ? colors.emphasis.primary : colors.text.muted}
            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
          />
        </View>
      )}

      {/* Two-column row */}
      <View
        style={[
          { flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs },
          dbgPanelBorder('#8b5cf6', b),
        ]}
      >
        {/* Left: day + date stack — takes all remaining space */}
        <View
          style={[
            {
              flex: 1,
              minWidth: 0,
              minHeight: DATE_PANEL_COLUMN_H,
              height: DATE_PANEL_COLUMN_H,
              justifyContent: 'center',
            },
            dbgPanelBorder('#ef4444', b),
          ]}
        >
          <Text
            style={[
              {
                fontFamily: fontFamily.generalSansMedium,
                fontSize: WEEKDAY_SIZE,
                lineHeight: WEEKDAY_LH,
                letterSpacing: letterSpacing.label,
                color: blue,
                marginBottom: spacing.xs,
              },
              dbgPanelTextBorder('#fbbf24', b),
            ]}
            numberOfLines={1}
          >
            {weekday}
          </Text>

          {/* Date block — self-measured to align day/month widths */}
          <View
            style={[
              { alignSelf: 'flex-start', width: dateBlockW },
              dbgPanelBorder('#34d399', b),
            ]}
          >
            <Text
              onLayout={(e: LayoutChangeEvent) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setDayIntrinsicW((prev) => (prev === w ? prev : w));
              }}
              style={[
                {
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_DAY,
                  lineHeight: DATE_DAY_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  textAlign: 'center',
                },
                dbgPanelTextBorder('#10b981', b),
              ]}
              numberOfLines={1}
            >
              {dayNum}
            </Text>
            <Text
              onLayout={(e: LayoutChangeEvent) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0) setMonthIntrinsicW((prev) => (prev === w ? prev : w));
              }}
              style={[
                {
                  fontFamily: fontFamily.michroma,
                  fontSize: DATE_MONTH,
                  lineHeight: DATE_MONTH_LH,
                  letterSpacing: letterSpacing.displayTight,
                  color: blue,
                  marginTop: MONTH_PULL_UP,
                  textAlign: 'center',
                },
                dbgPanelTextBorder('#059669', b),
              ]}
              numberOfLines={1}
            >
              {month}
            </Text>
          </View>
        </View>

        {/* Right: rail + times — fixed basis so it never competes with left */}
        <View
          ref={rightColumnRef}
          style={{
            flexShrink: 0,
            flexGrow: 0,
            flexBasis: '46%',
            minHeight: DATE_PANEL_COLUMN_H,
            height: DATE_PANEL_COLUMN_H,
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
          onLayout={() => requestAnimationFrame(measureTimeCenters)}
        >
          {/* Vertical rail */}
          <View
            style={{
              width: RAIL_W,
              height: DATE_PANEL_COLUMN_H,
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
          <View
            style={[
              {
                flex: 1,
                minWidth: 0,
                height: DATE_PANEL_COLUMN_H,
                justifyContent: 'center',
              },
              dbgPanelBorder('#f472b6', b),
            ]}
          >
            <Text
              style={[eventMetaLabel, { marginBottom: spacing.xs }, dbgPanelTextBorder('#fde047', b)]}
            >
              Events from
            </Text>
            <View ref={fromTimeWrapRef} collapsable={false} style={dbgPanelBorder('#2dd4bf', b)}>
              <Text
                style={[timeTextStyle, dbgPanelTextBorder('#5eead4', b)]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                onLayout={() => requestAnimationFrame(measureTimeCenters)}
              >
                {sessionWindow.from}
              </Text>
            </View>
            <View
              style={[
                {
                  marginVertical: spacing.sm,
                  minHeight: spacing.md,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                },
                dbgPanelBorder('#c084fc', b),
              ]}
            >
              <Text style={[eventMetaLabel, dbgPanelTextBorder('#fb923c', b)]}>to</Text>
            </View>
            <View ref={toTimeWrapRef} collapsable={false} style={dbgPanelBorder('#38bdf8', b)}>
              <Text
                style={[timeTextStyle, dbgPanelTextBorder('#7dd3fc', b)]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                onLayout={() => requestAnimationFrame(measureTimeCenters)}
              >
                {sessionWindow.to}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
