import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, shadows, borderRadius } from '@/lib/theme';

function NowIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4 13h7v9l9-11h-7V2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
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

function RoutinesIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 2l4 4-4 4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 11V9a4 4 0 014-4h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 22l-4-4 4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 13v2a4 4 0 01-4 4H3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CaptureIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path
        d="M12 8v8M8 12h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function GuideIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path
        d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type IconComponent = (props: { color: string; size: number }) => React.ReactElement;

const TAB_CONFIG: Record<string, { label: string; accent: string; Icon: IconComponent }> = {
  now: { label: 'Now', accent: colors.emphasis.primary, Icon: NowIcon },
  actions: { label: 'Actions', accent: colors.actions.primary, Icon: ActionsIcon },
  routines: { label: 'Routines', accent: colors.routines.primary, Icon: RoutinesIcon },
  capture: { label: 'Capture', accent: colors.capture.primary, Icon: CaptureIcon },
  guide: { label: 'Guide', accent: colors.guide.primary, Icon: GuideIcon },
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => route.name in TAB_CONFIG);

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
    </View>
  );
}
