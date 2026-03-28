import { useEffect, useState } from 'react';
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
  fontFamily: fontFamily.jakartaMedium,
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

  useEffect(() => {
    setDayIntrinsicW(0);
    setMonthIntrinsicW(0);
  }, [dateIso]);

  const d = parseISO(dateIso + 'T12:00:00');
  const weekday = format(d, 'EEEE');
  const dayNum = format(d, 'd');
  const month = format(d, 'MMM');

  const window =
    sessionFilter === 'all'
      ? getFullDayWindowLabels()
      : getSessionWindowLabels(sessionFilter);

  const blue = colors.emphasis.primary;

  const timeTextStyle = {
    fontFamily: fontFamily.michroma,
    fontSize: DATE_MONTH,
    lineHeight: DATE_MONTH_LH,
    letterSpacing: letterSpacing.displayTight,
    color: blue,
  } as const;

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, marginBottom: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs }}>
        {/* Left ~50% — fixed height matches right column */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '50%',
            minHeight: DATE_PANEL_COLUMN_H,
            height: DATE_PANEL_COLUMN_H,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.jakartaMedium,
              fontSize: WEEKDAY_SIZE,
              lineHeight: WEEKDAY_LH,
              letterSpacing: letterSpacing.label,
              color: blue,
              marginBottom: spacing.xs,
            }}
            numberOfLines={1}
          >
            {weekday}
          </Text>
          <View
            style={{
              width: dateBlockW,
              maxWidth: '100%',
              alignSelf: 'flex-start',
            }}
          >
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
                width: dateBlockW ? '100%' : undefined,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {dayNum}
            </Text>
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
                width: dateBlockW ? '100%' : undefined,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {month}
            </Text>
          </View>
        </View>

        {/* Right ~50%: rail + times — same height as left */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '50%',
            minHeight: DATE_PANEL_COLUMN_H,
            height: DATE_PANEL_COLUMN_H,
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
        >
          <View
            style={{
              width: RAIL_W,
              height: DATE_PANEL_COLUMN_H,
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: spacing.sm,
            }}
          >
            <View
              style={{
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
                width: LINE_W,
                flex: 1,
                minHeight: spacing.xs,
                backgroundColor: blue,
                opacity: 0.9,
                marginVertical: 2,
                borderRadius: 1,
              }}
            />
            <View
              style={{
                width: NODE,
                height: NODE,
                borderRadius: NODE / 2,
                backgroundColor: blue,
              }}
            />
          </View>

          <View
            style={{
              flex: 1,
              minWidth: 0,
              height: DATE_PANEL_COLUMN_H,
              justifyContent: 'center',
            }}
          >
            <Text style={[eventMetaLabel, { marginBottom: spacing.xs }]}>Events from</Text>
            <Text
              style={timeTextStyle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {window.from}
            </Text>
            <View
              style={{
                marginVertical: spacing.sm,
                minHeight: spacing.md,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <Text style={eventMetaLabel}>to</Text>
            </View>
            <Text
              style={timeTextStyle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {window.to}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
