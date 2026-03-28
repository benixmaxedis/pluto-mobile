import { useState } from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { CreateDrawer } from '@/components/ui/CreateDrawer';

export default function AppLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <FloatingTabBar {...props} onPlusPress={() => setDrawerVisible(true)} />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="today" options={{ title: 'Today' }} />
        <Tabs.Screen name="actions" options={{ title: 'Actions' }} />
        <Tabs.Screen name="reflect" options={{ title: 'Reflect' }} />
        {/* Secondary routes — hidden from tab bar */}
        <Tabs.Screen name="now" options={{ href: null }} />
        <Tabs.Screen name="routines" options={{ href: null }} />
        <Tabs.Screen name="capture" options={{ href: null }} />
        <Tabs.Screen name="guide" options={{ href: null }} />
        <Tabs.Screen name="activity" options={{ href: null }} />
        <Tabs.Screen name="pluto" options={{ href: null }} />
        <Tabs.Screen name="account" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
      </Tabs>

      <CreateDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}
