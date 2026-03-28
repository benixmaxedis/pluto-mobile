import { PlatformPressable } from '@react-navigation/elements';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

/** RN bottom tabs default to `justifyContent: 'flex-start'`; center icon + label in the bar. */
export function TabBarButtonCentered(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} style={[props.style, { justifyContent: 'center' }]} />;
}
