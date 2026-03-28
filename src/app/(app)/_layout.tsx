import { Tabs } from 'expo-router';
import { colors } from '@/lib/theme';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="actions" options={{ title: 'Actions' }} />
      <Tabs.Screen name="routines" options={{ title: 'Routines' }} />
      <Tabs.Screen name="now" options={{ title: 'Now' }} />
      <Tabs.Screen name="capture" options={{ title: 'Capture' }} />
      <Tabs.Screen name="guide" options={{ title: 'Guide' }} />
      {/* Secondary routes — hidden from tab bar */}
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="pluto" options={{ href: null }} />
      <Tabs.Screen name="account" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
