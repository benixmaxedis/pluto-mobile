import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '@/lib/theme';

/** Height of the floating tab bar pill (paddingVertical * 2 + icon + label + gap) */
const TAB_BAR_HEIGHT = 72;

export function CreateFAB({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create"
      style={({ pressed }: { pressed: boolean }) => ({
        position: 'absolute',
        bottom: insets.bottom + 12 + TAB_BAR_HEIGHT + 10,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        opacity: pressed ? 0.82 : 1,
        ...shadows.lg,
      })}
    >
      <LinearGradient
        colors={[colors.gradient.from, colors.gradient.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </LinearGradient>
    </Pressable>
  );
}
