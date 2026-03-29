import { useCallback, useRef, useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors, fontFamily, letterSpacing, spacing } from '@/lib/theme';
import {
  getFullDayWindowLabels,
  getSessionWindowLabels,
} from '@/features/now/session-time-format';
import type { NowSessionFilter } from '@/features/now/use-now-queues';

type Props = {
  dateIso: string;
  sessionFilter: NowSessionFilter;
};

const DATE_DAY_SIZE = 72;
const DATE_DAY_LH = 74;
const DATE_MONTH_SIZE = 48;
const DATE_MONTH_LH = 52;

const TIME_SIZE = 36;
const TIME_LH = 40;

const HEADING_SIZE = 15;
const HEADING_LH = 19;

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
  const [dayW, setDayW] = useState(0);
  const [monthW, setMonthW] = useState(0);
  const sharedW = dayW > 0 && monthW > 0 ? Math.max(dayW, monthW) : undefined;

  const railRef = useRef<View>(null);
  const fromTimeRef = useRef<Text | null>(null);
  const toTimeRef = useRef<Text | null>(null);
  const [railY, setRailY] = useState<{ from: number; to: number } | null>(null);

  const measureRail = useCallback(() => {
    const rail = railRef.current;
    const fromT = fromTimeRef.current;
    const toT = toTimeRef.current;
    if (!rail || !fromT || !toT) return;

    let fromMid: number | null = null;
    let toMid: number | null = null;
    const commit = () => {
      if (fromMid != null && toMid != null) setRailY({ from: fromMid, to: toMid });
    };

    fromT.measureLayout(rail, (_x, y, _w, h) => { fromMid = y + h / 2; commit(); }, () => {});
    toT.measureLayout(rail, (_x, y, _w, h) => { toMid = y + h / 2; commit(); }, () => {});
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
    <View style={{ paddingHorizontal: spacing.lg }}>
      {/* Main two-column row */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        {/* Left column — 60% */}
        <View
          style={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: '60%',
          }}
        >
          <Text style={headingStyle} numberOfLines={1}>
            {weekday}
          </Text>

          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: spacing.xs,
              width: sharedW,
              alignItems: 'center',
            }}
          >
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
              }}
              numberOfLines={1}
            >
              {dayNum}
            </Text>
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
                marginTop: spacing.hairline,
              }}
              numberOfLines={1}
            >
              {month}
            </Text>
          </View>
        </View>

        {/* Right column — 40% */}
        <View
          style={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: '40%',
          }}
        >
          <Text style={headingStyle} numberOfLines={1}>
            Events from
          </Text>

          {/* Times area: rail + times stack */}
          <View
            ref={railRef}
            collapsable={false}
            onLayout={onTimesLayout}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'stretch',
              marginTop: spacing.xs,
            }}
          >
            {/* Vertical rail */}
            <View
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
                    {/* Open circle — top */}
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
                    {/* Connecting line */}
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
                    {/* Filled circle — bottom */}
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

            {/* Times stack — space-between distributes top time / "to" / bottom time */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <Text
                ref={fromTimeRef}
                style={timeStyle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                onLayout={onTimesLayout}
              >
                {fromLabel}
              </Text>

              <Text style={toStyle}>to</Text>

              <Text
                ref={toTimeRef}
                style={timeStyle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                onLayout={onTimesLayout}
              >
                {toLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
