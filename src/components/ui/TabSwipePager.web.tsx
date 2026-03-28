import { Children, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type TabSwipePagerProps = {
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Web: no react-native-pager-view (native-only). Shows the active tab only;
 * SegmentedControl still drives selectedIndex / onIndexChange.
 */
export function TabSwipePager({ selectedIndex, children, style }: TabSwipePagerProps) {
  const pages = Children.toArray(children);
  return <View style={[{ flex: 1 }, style]}>{pages[selectedIndex] ?? null}</View>;
}
