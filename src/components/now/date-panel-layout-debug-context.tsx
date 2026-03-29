import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { View, Text, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/lib/theme';
import {
  DATE_PANEL_LAYOUT_DEBUG_UI,
  DEBUG_DATE_PANEL_BORDERS_INITIAL,
} from '@/components/now/debug-layout-borders';

/** Space for FloatingTabBar: `bottom` offset 12 + max(pill, plus) ~64px */
const FLOATING_TAB_BAR_CLEARANCE = 12 + 64;

type Ctx = {
  panelLayoutBorders: boolean;
  setPanelLayoutBorders: (next: boolean) => void;
};

const DatePanelLayoutDebugContext = createContext<Ctx | null>(null);

export function useDatePanelLayoutDebug(): Ctx {
  const ctx = useContext(DatePanelLayoutDebugContext);
  if (!ctx) {
    throw new Error('useDatePanelLayoutDebug must be used within DatePanelLayoutDebugProvider');
  }
  return ctx;
}

/** Optional: Today/legacy screens not under provider yet */
export function DatePanelLayoutDebugProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [panelLayoutBorders, setPanelLayoutBorders] = useState(DEBUG_DATE_PANEL_BORDERS_INITIAL);

  const value = useMemo(
    () => ({ panelLayoutBorders, setPanelLayoutBorders }),
    [panelLayoutBorders],
  );

  const debugBarBottom = insets.bottom + FLOATING_TAB_BAR_CLEARANCE + 6;

  return (
    <DatePanelLayoutDebugContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {DATE_PANEL_LAYOUT_DEBUG_UI && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: debugBarBottom,
              zIndex: 100,
              elevation: 100,
              alignItems: 'center',
            }}
          >
            <View
              pointerEvents="auto"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                marginHorizontal: spacing.lg,
                maxWidth: 360,
                width: '100%',
                backgroundColor: colors.surfaceRaised,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.text.secondary }}>Date panel borders</Text>
              <Switch
                accessibilityLabel="Toggle date panel layout borders"
                value={panelLayoutBorders}
                onValueChange={setPanelLayoutBorders}
                trackColor={{ false: colors.border, true: colors.emphasis.primary + '88' }}
                thumbColor={panelLayoutBorders ? colors.emphasis.primary : colors.text.muted}
              />
            </View>
          </View>
        )}
      </View>
    </DatePanelLayoutDebugContext.Provider>
  );
}
