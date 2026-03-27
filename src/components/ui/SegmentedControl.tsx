import { ScrollView, Pressable, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/lib/theme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  accentColor?: string;
  scrollable?: boolean;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
  accentColor = colors.actions.primary,
  scrollable = false,
}: SegmentedControlProps) {
  const content = segments.map((label, index) => {
    const isSelected = index === selectedIndex;
    return (
      <Pressable
        key={label}
        onPress={() => onSelect(index)}
        style={({ pressed }) => ({
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.full,
          backgroundColor: isSelected ? `${accentColor}22` : 'transparent',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: isSelected ? '600' : '400',
            color: isSelected ? accentColor : colors.text.muted,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs, paddingHorizontal: spacing.lg }}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.lg }}>
      {content}
    </View>
  );
}
