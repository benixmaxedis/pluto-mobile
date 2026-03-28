import type { ReactNode } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius, typographyStyles } from '@/lib/theme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  accentColor?: string;
  scrollable?: boolean;
  /** 'accent' = selected segment uses emphasis fill inside a single track */
  selectionStyle?: 'accent' | 'neutral';
  labelFontSize?: number;
  renderSegmentLeading?: (index: number, isSelected: boolean) => ReactNode;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
  accentColor = colors.emphasis.primary,
  scrollable = false,
  selectionStyle = 'accent',
  labelFontSize = fontSize.sm,
  renderSegmentLeading,
}: SegmentedControlProps) {
  const neutral = selectionStyle === 'neutral';

  const segmentInner = segments.map((label, index) => {
    const isSelected = index === selectedIndex;
    const leading = renderSegmentLeading?.(index, isSelected);
    const labelColor = neutral
      ? isSelected
        ? colors.text.primary
        : colors.text.secondary
      : isSelected
        ? colors.text.primary
        : colors.text.secondary;

    return (
      <Pressable
        key={label}
        onPress={() => onSelect(index)}
        style={({ pressed }) => ({
          flex: scrollable ? undefined : 1,
          paddingHorizontal: scrollable ? spacing.md : spacing.sm,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.md,
          backgroundColor:
            neutral || !isSelected
              ? 'transparent'
              : `${accentColor}2A`,
          opacity: pressed ? 0.85 : 1,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {leading}
          <Text
            style={{
              fontFamily: isSelected ? typographyStyles.title.fontFamily : typographyStyles.bodySmall.fontFamily,
              fontSize: labelFontSize,
              letterSpacing: typographyStyles.label.letterSpacing,
              fontWeight: undefined,
              color: labelColor,
            }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  });

  const trackStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.hairline,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        <View style={trackStyle}>{segmentInner}</View>
      </ScrollView>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View style={trackStyle}>{segmentInner}</View>
    </View>
  );
}
