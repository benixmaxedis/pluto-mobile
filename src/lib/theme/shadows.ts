import { Platform } from 'react-native';

const soft = (opacity: number, radius: number, y: number) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation: Math.min(12, Math.max(1, Math.round(radius / 2))) },
  });

/** Soft, diffuse elevation — avoid harsh drops */
export const shadows = {
  sm: soft(0.12, 10, 2),
  md: soft(0.16, 16, 4),
  lg: soft(0.2, 24, 8),
} as const;
