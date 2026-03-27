/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pluto: {
          bg: '#0F1117',
          surface: '#1A1D27',
          'surface-elevated': '#232735',
          border: '#2E3243',
          action: '#A78BFA',
          'action-secondary': '#7C3AED',
          routine: '#2DD4BF',
          'routine-secondary': '#0D9488',
          capture: '#60A5FA',
          'capture-secondary': '#2563EB',
          guide: '#FBBF24',
          'guide-secondary': '#D97706',
          strategy: '#FB923C',
          'strategy-secondary': '#EA580C',
        },
      },
    },
  },
  plugins: [],
};
