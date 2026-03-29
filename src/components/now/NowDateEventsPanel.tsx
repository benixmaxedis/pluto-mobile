import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, letterSpacing, spacing } from '@/lib/theme';
import {
  getFullDayWindowLabels,
  getSessionWindowLabels,
} from '@/features/now/session-time-format';
import type { NowSessionFilter } from '@/features/now/use-now-queues';
import { dbgBorder, dbgTextBorder } from '@/components/now/debug-layout-borders';

type Props = {
  dateIso: string;
  sessionFilter: NowSessionFilter;
};

/** Larger display numerals — tight vertical rhythm between day & month */
const DATE_DAY = 70;
const DATE_DAY_LH = 72;
const DATE_MONTH = 48;
const DATE_MONTH_LH = 50;
/** Pull month up toward day (gap was too loose) */
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

/** Fixed block height so left (date) and right (rail + times) columns match */
const DATE_PANEL_COLUMN_H = 150;

export function NowDateEventsPanel({ dateIso, sessionFilter }: Props) {
  const [dayIntrinsicW, setDayIntrinsicW] = useState(0);
  const [monthIntrinsicW, setMonthIntrinsicW] = useState(0);
  const dateBlockW =
    dayIntrinsicW > 0 && monthIntrinsicW > 0 ? Math.max(dayIntrinsicW, monthIntrinsicW) : undefined;

  const rightColumnRef = useRef<View>(null);
  const fromTimeWrapRef = useRef<View>(null);
  const toTimeWrapRef = useRef<View>(null);
  /** Vertical centers of the two Michroma time rows inside the right column (px from top) */
  const [timeCentersY, setTimeCentersY] = useState<{ from: number; to: number } | null>(null);

  const measureTimeCenters = useCallback(() => {
    const host = rightColumnRef.current;
    const fromW = fromTimeWrapRef.current;
    const toW = toTimeWrapRef.current;
    if (!host || !fromW || !toW) return;

    let fromMid: number | null = null;
    let toMid: number | null = null;
    const commit = () => {
      if (fromMid != null && toMid != null) {
        setTimeCentersY({ from: fromMid, to: toMid });
      }
    };

    fromW.measureLayout(
      host,
      (_x, y, _w, h) => {
        fromMid = y + h / 2;
        commit();
      },
      () => {},
    );
    toW.measureLayout(
      host,
      (_x, y, _w, h) => {
        toMid = y + h / 2;
        commit();
      },
      () => {},
    );
  }, []);

  useEffect(() => {
    setDayIntrinsicW(0);
    setMonthIntrinsicW(0);
    setTimeCentersY(null);
  }, [dateIso]);

  const d = parseISO(dateIso + 'T12:00:00');
  const weekday = format(d, 'EEEE');
  const dayNum = format(d, 'd');
  const month = format(d, 'MMM');

  const sessionWindow =
    sessionFilter === 'all'
      ? getFullDayWindowLabels()
      : getSessionWindowLabels(sessionFilter);

  const sessionWindowKey = `${sessionFilter}:${sessionWindow.from}|${sessionWindow.to}`;

  useEffect(() => {
    setTimeCentersY(null);
  }, [sessionWindowKey]);

  const blue = colors.emphasis.primary;

  const timeTextStyle = {
    fontFamily: fontFamily.michroma,
    fontSize: DATE_MONTH,
    lineHeight: DATE_MONTH_LH,
    letterSpacing: letterSpacing.displayTight,
    color: blue,
  } as const;

  return (
    <View
      style={[
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, marginBottom: spacing.xs },
        dbgBorder('#ec4899'),
      ]}
    >
      <View
        style={[{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs }, dbgBorder('#8b5cf6')]}
      >
        {/* Left ~50% — fixed height matches right column */}
        <View
          style={[
            {
              flex: 1,
              minWidth: 0,
              maxWidth: '50%',
              minHeight: DATE_PANEL_COLUMN_H,
              height: DATE_PANEL_COLUMN_H,
              justifyContent: 'center',
            },
            dbgBorder('#ef4444'),
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
              dbgTextBorder('#fbbf24'),
            ]}
            numberOfLines={1}
          >
            {weekday}
          </Text>
          <View
            style={[
              {
                width: dateBlockW,
                maxWidth: '100%',
                alignSelf: 'flex-start',
              },
              dbgBorder('#34d399'),
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
                  width: dateBlockW ? '100%' : undefined,
                  textAlign: 'center',
                },
                dbgTextBorder('#10b981'),
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
                  width: dateBlockW ? '100%' : undefined,
                  textAlign: 'center',
                },
                dbgTextBorder('#059669'),
              ]}
              numberOfLines={1}
            >
              {month}
            </Text>
          </View>
        </View>

        {/* Right ~50%: rail between time row centers + times */}
        <View
          ref={rightColumnRef}
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '50%',
            minHeight: DATE_PANEL_COLUMN_H,
            height: DATE_PANEL_COLUMN_H,
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
          onLayout={() => requestAnimationFrame(measureTimeCenters)}
        >
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

          <View
            style={[
              {
                flex: 1,
                minWidth: 0,
                height: DATE_PANEL_COLUMN_H,
                justifyContent: 'center',
              },
              dbgBorder('#f472b6'),
            ]}
          >
            <Text
              style={[eventMetaLabel, { marginBottom: spacing.xs }, dbgTextBorder('#fde047')]}
            >
              Events from
            </Text>
            <View ref={fromTimeWrapRef} collapsable={false} style={dbgBorder('#2dd4bf')}>
              <Text
                style={[timeTextStyle, dbgTextBorder('#5eead4')]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
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
                dbgBorder('#c084fc'),
              ]}
            >
              <Text style={[eventMetaLabel, dbgTextBorder('#fb923c')]}>to</Text>
            </View>
            <View ref={toTimeWrapRef} collapsable={false} style={dbgBorder('#38bdf8')}>
              <Text
                style={[timeTextStyle, dbgTextBorder('#7dd3fc')]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
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
