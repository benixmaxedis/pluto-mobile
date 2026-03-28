export const colors = {
  // Base — layered depth (avoid flat single surface)
  background: '#0C0E14',
  surface: '#13161D',
  /** Cards / inset panels */
  surfaceRaised: '#1A1E28',
  surfaceElevated: '#222731',
  /** Translucent wash for overlays */
  surfaceOverlay: 'rgba(255, 255, 255, 0.04)',
  border: '#2A3040',
  borderSubtle: 'rgba(240, 240, 245, 0.08)',
  borderStrong: 'rgba(240, 240, 245, 0.14)',

  // Text
  text: {
    primary: '#F0F0F5',
    secondary: '#9BA3B5',
    /** Prefer `secondary` for UI copy; keep for rare non-typography cases only. */
    muted: '#6B7288',
  },

  // Feature accents (use sparingly — prefer neutral surfaces + one emphasis)
  actions: { primary: '#A78BFA', secondary: '#7C3AED' },
  routines: { primary: '#2DD4BF', secondary: '#0D9488' },
  capture: { primary: '#60A5FA', secondary: '#2563EB' },
  guide: { primary: '#FBBF24', secondary: '#D97706' },
  strategies: { primary: '#FB923C', secondary: '#EA580C' },

  /**
   * Single cool accent (calendar / Now hero) — muted blue, high horizontal presence.
   * `onAccent` = text/icons on solid blue fills (charcoal, not white).
   */
  emphasis: {
    primary: '#8EB9F0',
    onAccent: '#0C0E14',
    muted: 'rgba(142, 185, 240, 0.2)',
    line: 'rgba(142, 185, 240, 0.55)',
  },

  // Gradient
  gradient: { from: '#A78BFA', to: '#2DD4BF' },

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
} as const;
