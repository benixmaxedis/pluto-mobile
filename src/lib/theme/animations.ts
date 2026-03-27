export const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const spring = {
  gentle: { damping: 20, stiffness: 150, mass: 1 },
  snappy: { damping: 15, stiffness: 300, mass: 0.8 },
  bouncy: { damping: 10, stiffness: 200, mass: 1 },
} as const;
