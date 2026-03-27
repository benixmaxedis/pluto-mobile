import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '@/lib/theme';

export default function PlutoScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary }}>
          Pluto
        </Text>
        <Text style={{ fontSize: fontSize.base, color: colors.text.secondary, marginTop: spacing.sm }}>
          Your AI guide. Ask anything.
        </Text>
      </View>
    </SafeAreaView>
  );
}
