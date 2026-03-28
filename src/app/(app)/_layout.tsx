import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { colors } from '@/lib/theme';
import { NowTabBarItem } from '@/components/navigation/NowTabBarItem';
import { TabBarButtonCentered } from '@/components/navigation/TabBarButtonCentered';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function tabBarIcon(outline: IoniconName, solid: IoniconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? solid : outline} size={size} color={color} />
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarButton: (props) => <TabBarButtonCentered {...props} />,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '400',
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: colors.actions.primary,
        /** Slightly brighter than body secondary so icon + label stay visible when the center Now tab is selected. */
        tabBarInactiveTintColor: 'rgba(240, 240, 245, 0.52)',
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 6,
        },
      }}
    >
      <Tabs.Screen
        name="actions"
        options={{
          title: 'Actions',
          tabBarActiveTintColor: colors.actions.primary,
          tabBarIcon: tabBarIcon('checkbox-outline', 'checkbox'),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Routines',
          tabBarActiveTintColor: colors.routines.primary,
          tabBarIcon: tabBarIcon('repeat-outline', 'repeat'),
        }}
      />
      <Tabs.Screen
        name="now"
        options={{
          title: 'Now',
          tabBarActiveTintColor: colors.emphasis.primary,
          tabBarIcon: ({ focused, size }) => <NowTabBarItem focused={focused} size={size} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarActiveTintColor: colors.capture.primary,
          tabBarIcon: tabBarIcon('add-circle-outline', 'add-circle'),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Guide',
          tabBarActiveTintColor: colors.guide.primary,
          tabBarIcon: tabBarIcon('book-outline', 'book'),
        }}
      />
      {/* Secondary routes — hidden from tab bar */}
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="pluto" options={{ href: null }} />
      <Tabs.Screen name="account" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
