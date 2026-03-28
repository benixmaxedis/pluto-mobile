import { Children, useRef, useEffect, type ReactNode } from 'react';
import { View, Platform, type StyleProp, type ViewStyle } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';

export type TabSwipePagerProps = {
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Horizontal swipe between tab pages, kept in sync with SegmentedControl.
 * On web, only the active page mounts (no swipe; tabs still work).
 */
export function TabSwipePager({
  selectedIndex,
  onIndexChange,
  children,
  style,
}: TabSwipePagerProps) {
  const pagerRef = useRef<PagerView>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    pagerRef.current?.setPageWithoutAnimation(selectedIndex);
  }, [selectedIndex]);

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    const pos = e.nativeEvent.position;
    if (pos !== selectedIndex) {
      onIndexChange(pos);
    }
  };

  if (Platform.OS === 'web') {
    const pages = Children.toArray(children);
    return <View style={[{ flex: 1 }, style]}>{pages[selectedIndex] ?? null}</View>;
  }

  return (
    <PagerView
      ref={pagerRef}
      style={[{ flex: 1 }, style]}
      initialPage={selectedIndex}
      onPageSelected={handlePageSelected}
    >
      {children}
    </PagerView>
  );
}
