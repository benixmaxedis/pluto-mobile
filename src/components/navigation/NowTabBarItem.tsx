import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/lib/theme';

/**
 * Now tab — solid emphasis blue when focused (matches Now screen accent).
 */
export function NowTabBarItem({ focused, size }: { focused: boolean; size: number }) {
  const accent = colors.emphasis.primary;
  return (
    <View style={styles.wrap}>
      <Ionicons name={focused ? 'flash' : 'flash-outline'} size={size} color={focused ? accent : colors.text.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
