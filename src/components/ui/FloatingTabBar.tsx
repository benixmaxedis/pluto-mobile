import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, shadows, borderRadius } from '@/lib/theme';
import { useUIStore } from '@/store/ui-store';

// ── Icons ─────────────────────────────────────────────────────────────────────

function TodayIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={17} rx={2} stroke={color} strokeWidth={2} />
      <Path
        d="M3 9h18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 2v3M16 2v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 13h1M12 13h1M16 13h1M8 17h1M12 17h1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ActionsIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11l3 3 8-8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ReflectIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 4.5l1.5 1.5M16.5 4.5L15 6M19.5 9l-1.5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type IconComponent = (props: { color: string; size: number }) => React.ReactElement;

const TAB_CONFIG: Record<string, { label: string; accent: string; Icon: IconComponent }> = {
  today: { label: 'Today', accent: colors.emphasis.primary, Icon: TodayIcon },
  actions: { label: 'Actions', accent: colors.actions.primary, Icon: ActionsIcon },
  reflect: { label: 'Reflect', accent: colors.guide.primary, Icon: ReflectIcon },
};

// ── FloatingTabBar ─────────────────────────────────────────────────────────────

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const triggerPlus = useUIStore((s) => s.triggerPlus);
  const plusHandler = useUIStore((s) => s.plusHandler);

  const visibleRoutes = state.routes.filter((route) => route.name in TAB_CONFIG);

  // Determine the accent of the active tab for the plus button
  const activeRoute = state.routes[state.index];
  const activeAccent = TAB_CONFIG[activeRoute?.name]?.accent ?? colors.text.muted;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: insets.bottom + 12,
        left: 20,
        right: 20,
      }}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 6,
            paddingVertical: 6,
          },
          shadows.lg,
        ]}
      >
        {/* Tab buttons */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {visibleRoutes.map((route) => {
            const routeIndex = state.routes.indexOf(route);
            const isFocused = state.index === routeIndex;
            const config = TAB_CONFIG[route.name];
            if (!config) return null;

            const { label, accent, Icon } = config;
            const iconColor = isFocused ? accent : colors.text.muted;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
                style={({ pressed }: { pressed: boolean }) => ({
                  flex: 1,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  paddingVertical: 8,
                  borderRadius: borderRadius.full,
                  backgroundColor: isFocused
                    ? accent + '22'
                    : pressed
                      ? colors.border + '66'
                      : 'transparent',
                })}
              >
                <Icon color={iconColor} size={20} />
                <Text
                  style={{
                    fontSize: 10,
                    marginTop: 3,
                    color: iconColor,
                    fontWeight: isFocused ? '600' : '400',
                    letterSpacing: 0.2,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Plus button */}
        <Pressable
          onPress={triggerPlus}
          accessibilityRole="button"
          accessibilityLabel="Create new"
          style={({ pressed }: { pressed: boolean }) => ({
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: plusHandler
              ? activeAccent + '22'
              : colors.border + '44',
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginLeft: 4,
            opacity: pressed ? 0.7 : plusHandler ? 1 : 0.4,
          })}
        >
          <Text
            style={{
              fontSize: 22,
              color: plusHandler ? activeAccent : colors.text.muted,
              fontWeight: '300',
              marginTop: -1,
            }}
          >
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
