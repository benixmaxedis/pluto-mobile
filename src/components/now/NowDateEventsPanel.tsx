import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, Platform, type LayoutChangeEvent, type TextStyle } from 'react-native';
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
/** Must be ≥ fontSize or RN clips the top/bottom of display numerals. */
const DATE_DAY_LH = 72;
const DATE_MONTH = 54;
/** Extra vertical room so Michroma “MMM” doesn’t clip / breach its outline. */
const DATE_MONTH_LH = 58;

const WEEKDAY_SIZE = 15;
const WEEKDAY_LH = 19;

const RAIL_W = 14;
const NODE = 8;
const LINE_W = 2;

/** “to” label — secondary; weekday / “Events from” use `weekdayRowText`. */
const eventMetaLabel = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: 13,
  lineHeight: 17,
  letterSpacing: letterSpacing.label,
  color: colors.text.secondary,
} as const;

/** Master row label: weekday + “Events from” (same size, alignment). */
const weekdayRowTextBase = {
  fontFamily: fontFamily.generalSansMedium,
  fontSize: WEEKDAY_SIZE,
  lineHeight: WEEKDAY_LH,
  letterSpacing: letterSpacing.label,
} as const;

/** Android only — trims extra padding under display numerals */
const androidTightNumerals: TextStyle | undefined =
  Platform.OS === 'android' ? { includeFontPadding: false } : undefined;

export function NowDateEventsPanel({ dateIso, sessionFilter, panelLayoutBorders = false }: Props) {
  const [dayIntrinsicW, setDayIntrinsicW] = useState(0);
  const [monthIntrinsicW, setMonthIntrinsicW] = useState(0);
  const dateBlockW =
    dayIntrinsicW > 0 && monthIntrinsicW > 0
      ? Math.max(dayIntrinsicW, monthIntrinsicW)
      : undefined;

  const dateTimesRowRef = useRef<View>(null);
  const dayTextRef = useRef<Text | null>(null);
  const monthMeasureRef = useRef<View>(null);
  const rightColumnRef = useRef<View>(null);
  const fromTimeTextRef = useRef<Text | null>(null);
  const toTimeTextRef = useRef<Text | null>(null);
  const [timeCentersY, setTimeCentersY] = useState<{ from: number; to: number } | null>(null);
  /** Cumulative margins so re-measure after layout does not zero out correction (see syncTimeAlign). */
  const [timeAlign, setTimeAlign] = useState({ fromMarginTop: 0, toSectionMarginTop: 0 });

  const measureTimeCenters = useCallback(() => {
    const host = rightColumnRef.current;
    const fromT = fromTimeTextRef.current;
    const toT = toTimeTextRef.current;
    if (!host || !fromT || !toT) return;

    let fromMid: number | null = null;
    let toMid: number | null = null;
    const commit = () => {
      if (fromMid != null && toMid != null) setTimeCentersY({ from: fromMid, to: toMid });
    };

    fromT.measureLayout(host, (_x, y, _w, h) => { fromMid = y + h / 2; commit(); }, () => {});
    toT.measureLayout(host, (_x, y, _w, h) => { toMid = y + h / 2; commit(); }, () => {});
  }, []);

  /** Top of from-time Text ↔ top of day Text (independent of to-time so first layout can run). */
  const syncFromTimeToDayTop = useCallback(() => {
    const row = dateTimesRowRef.current;
    const dayEl = dayTextRef.current;
    const fromEl = fromTimeTextRef.current;
    if (!row || !dayEl || !fromEl) return;

    dayEl.measureLayout(
      row,
      (_x, yDay) => {
        fromEl.measureLayout(
          row,
          (_x, yFrom) => {
            const fromDelta = Math.abs(yDay - yFrom) < 0.5 ? 0 : yDay - yFrom;
            setTimeAlign((prev) => {
              const fromMarginTop = Math.round(prev.fromMarginTop + fromDelta);
              if (fromMarginTop === prev.fromMarginTop) return prev;
              return { ...prev, fromMarginTop };
            });
          },
          () => {},
        );
      },
      () => {},
    );
  }, []);

  /** Bottom of to-time ↔ bottom of month (separate pass). */
  const syncToTimeToMonthBottom = useCallback(() => {
    const row = dateTimesRowRef.current;
    const monthEl = monthMeasureRef.current;
    const toEl = toTimeTextRef.current;
    if (!row || !monthEl || !toEl) return;

    monthEl.measureLayout(
      row,
      (_x, yM, _wM, hM) => {
        const monthBottom = yM + hM;
        toEl.measureLayout(
          row,
          (_x, yTo, _wT, hT) => {
            const toBottom = yTo + hT;
            const toDelta = Math.abs(monthBottom - toBottom) < 0.5 ? 0 : monthBottom - toBottom;
            setTimeAlign((prev) => {
              const toSectionMarginTop = Math.round(prev.toSectionMarginTop + toDelta);
              if (toSectionMarginTop === prev.toSectionMarginTop) return prev;
              return { ...prev, toSectionMarginTop };
            });
          },
          () => {},
        );
      },
      () => {},
    );
  }, []);

  const syncTimeAlign = useCallback(() => {
    syncFromTimeToDayTop();
    syncToTimeToMonthBottom();
  }, [syncFromTimeToDayTop, syncToTimeToMonthBottom]);

  const onDateTimesRowLayout = useCallback(() => {
    requestAnimationFrame(() => {
      syncTimeAlign();
      measureTimeCenters();
    });
  }, [syncTimeAlign, measureTimeCenters]);

  useEffect(() => {
    setDayIntrinsicW(0);
    setMonthIntrinsicW(0);
    setTimeCentersY(null);
    setTimeAlign({ fromMarginTop: 0, toSectionMarginTop: 0 });
  }, [dateIso]);

  const sessionWindow =
    sessionFilter === 'all'
      ? getFullDayWindowLabels()
      : getSessionWindowLabels(sessionFilter);

  const sessionWindowKey = `${sessionFilter}:${sessionWindow.from}|${sessionWindow.to}`;
  useEffect(() => {
    setTimeCentersY(null);
    setTimeAlign({ fromMarginTop: 0, toSectionMarginTop: 0 });
  }, [sessionWindowKey]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      syncTimeAlign();
      measureTimeCenters();
    });
  }, [timeAlign.fromMarginTop, timeAlign.toSectionMarginTop, dateBlockW, syncTimeAlign, measureTimeCenters]);

  const blue = colors.emphasis.primary;
  const b = panelLayoutBorders;

  const weekdayRowText = { ...weekdayRowTextBase, color: blue } as const;

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
      {/* Two-column row — inner View is measure host for day/month vs times */}
      <PanelDebugOutline color="#8b5cf6" enabled={b} style={{ alignSelf: 'stretch' }}>
        <View
          ref={dateTimesRowRef}
          collapsable={false}
          onLayout={onDateTimesRowLayout}
          style={{ flexDirection: 'column', alignSelf: 'stretch' }}
        >
          {/* Weekday + “Events from” share one row; weekday is typographic master */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <PanelDebugOutline color="#fbbf24" enabled={b} style={{ alignSelf: 'flex-start' }}>
                <Text style={weekdayRowText} numberOfLines={1}>
                  {weekday}
                </Text>
              </PanelDebugOutline>
            </View>
            <View style={{ width: RAIL_W, marginRight: spacing.sm }} />
            <View
              style={{
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: '46%',
                minWidth: 0,
              }}
            >
              <PanelDebugOutline color="#fde047" enabled={b} style={{ alignSelf: 'flex-start' }}>
                <Text style={weekdayRowText} numberOfLines={1}>
                  Events from
                </Text>
              </PanelDebugOutline>
            </View>
          </View>

          {/* Body: date block (left) + rail / session times (right).
              No flex:1 here — parent column has no fixed height; flex:1 would collapse this row to 0. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'stretch',
              gap: spacing.xs,
            }}
          >
        <PanelDebugOutline
          color="#ef4444"
          enabled={b}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
          }}
        >
            {/* Date block sits just under weekday row with a small gap */}
            <PanelDebugOutline
              color="#34d399"
              enabled={b}
              style={{
                alignSelf: 'flex-start',
                marginTop: spacing.sm,
                width: dateBlockW,
                alignItems: 'center',
                overflow: 'visible',
              }}
            >
              <View collapsable={false} style={{ alignSelf: 'center' }}>
                <PanelDebugOutline color="#10b981" enabled={b} style={{ alignSelf: 'center', overflow: 'visible' }}>
                  <Text
                    ref={dayTextRef}
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
                      androidTightNumerals,
                    ]}
                    numberOfLines={1}
                  >
                    {dayNum}
                  </Text>
                </PanelDebugOutline>
              </View>
              <View ref={monthMeasureRef} collapsable={false} style={{ alignSelf: 'center' }}>
                <PanelDebugOutline color="#059669" enabled={b} style={{ alignSelf: 'center', overflow: 'visible' }}>
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
                        textAlign: 'center',
                      },
                      androidTightNumerals,
                    ]}
                    numberOfLines={1}
                  >
                    {month}
                  </Text>
                </PanelDebugOutline>
              </View>
            </PanelDebugOutline>
        </PanelDebugOutline>

        <View
          ref={rightColumnRef}
          style={{
            flexShrink: 0,
            flexGrow: 0,
            flexBasis: '46%',
            flexDirection: 'row',
            alignItems: 'stretch',
            minWidth: 0,
          }}
          onLayout={onDateTimesRowLayout}
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
              minHeight: 0,
              justifyContent: 'flex-start',
              /** Matches date block `marginTop` so from-time and day start on the same baseline pass. */
              paddingTop: spacing.sm,
            }}
          >
            <View collapsable={false} style={{ marginTop: timeAlign.fromMarginTop }}>
              <PanelDebugOutline color="#2dd4bf" enabled={b}>
                <Text
                  ref={fromTimeTextRef}
                  style={[timeTextStyle, androidTightNumerals]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  onLayout={onDateTimesRowLayout}
                >
                  {sessionWindow.from}
                </Text>
              </PanelDebugOutline>
            </View>
            <View
              style={{
                flex: 1,
                minHeight: 0,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <PanelDebugOutline color="#c084fc" enabled={b} style={{ alignItems: 'flex-start' }}>
                <Text style={eventMetaLabel}>to</Text>
              </PanelDebugOutline>
            </View>
            <View collapsable={false} style={{ marginTop: timeAlign.toSectionMarginTop }}>
              <PanelDebugOutline color="#38bdf8" enabled={b}>
                <Text
                  ref={toTimeTextRef}
                  style={[timeTextStyle, androidTightNumerals]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  onLayout={onDateTimesRowLayout}
                >
                  {sessionWindow.to}
                </Text>
              </PanelDebugOutline>
            </View>
          </PanelDebugOutline>
        </View>
          </View>
        </View>
      </PanelDebugOutline>
    </PanelDebugOutline>
  );
}
