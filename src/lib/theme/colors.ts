export const colors = {
  // Base
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceElevated: '#232735',
  border: '#2E3243',

  // Text
  text: {
    primary: '#F0F0F5',
    secondary: '#9CA3B4',
    muted: '#636B80',
  },

  // Feature accents
  actions: { primary: '#A78BFA', secondary: '#7C3AED' },
  routines: { primary: '#2DD4BF', secondary: '#0D9488' },
  capture: { primary: '#60A5FA', secondary: '#2563EB' },
  guide: { primary: '#FBBF24', secondary: '#D97706' },
  strategies: { primary: '#FB923C', secondary: '#EA580C' },

  // Gradient
  gradient: { from: '#A78BFA', to: '#2DD4BF' },

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
} as const;
