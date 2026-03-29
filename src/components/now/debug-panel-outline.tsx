import { View, type StyleProp, type ViewStyle } from 'react-native';

const OUTLINE_W = 1;

type Props = {
  color: string;
  enabled: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Debug outline that does not consume layout space (unlike borderWidth on the same box).
 * Nested borders no longer shrink fixed-height columns or clip Text.
 */
export function PanelDebugOutline({ color, enabled, style, children }: Props) {
  if (!enabled) {
    return <View style={style}>{children}</View>;
  }
  return (
    <View style={[{ position: 'relative' }, style]}>
      {children}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderWidth: OUTLINE_W,
          borderStyle: 'solid',
          borderColor: color,
        }}
      />
    </View>
  );
}
