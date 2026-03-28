import { useState } from 'react';
import { View, Text, Platform, LayoutChangeEvent } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { colors, textStyles } from '@/lib/theme';
import { NAV_BRAND_GRADIENT } from './nav-brand-gradient';

export function formatNowScreenDateHeading(iso: string): string {
  return format(new Date(iso + 'T12:00:00'), 'EEE do MMM');
}

export function GradientDateHeading({
  dateIso,
  centered = false,
}: {
  dateIso: string;
  /** When true, heading is centered in the parent row (e.g. between date arrows). */
  centered?: boolean;
}) {
  const label = formatNowScreenDateHeading(dateIso);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const onMeasure = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize((prev) =>
        prev && prev.w === width && prev.h === height ? prev : { w: width, h: height },
      );
    }
  };

  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          textStyles.screenTitle,
          { color: colors.actions.primary, alignSelf: centered ? 'center' : 'flex-start' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    );
  }

  return (
    <View
      style={{
        alignSelf: centered ? 'center' : 'flex-start',
        minHeight: 34,
        justifyContent: 'center',
      }}
    >
      {!size ? (
        <Text style={[textStyles.screenTitle, { opacity: 0 }]} onLayout={onMeasure}>
          {label}
        </Text>
      ) : (
        <MaskedView
          style={{ width: size.w, height: size.h }}
          maskElement={
            <View
              style={{
                width: size.w,
                height: size.h,
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text style={[textStyles.screenTitle, { color: '#000' }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          }
        >
          <LinearGradient
            colors={[...NAV_BRAND_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: size.w, height: size.h }}
          />
        </MaskedView>
      )}
    </View>
  );
}
