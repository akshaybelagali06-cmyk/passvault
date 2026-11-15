import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  dark: {
    background:        '#0A0C12',
    surface:           '#1A1D26',
    surfaceHighlight:  '#252A35',
    border:            '#39404F',
    text:              '#F7F8FC',
    textSecondary:     '#B4BAC8',
    accent:            '#2DD4BF',
    accentMuted:       '#164C50',
    danger:            '#FF7A7A',
    success:           '#63D69A',
    // legacy compat keys used by ThemedView / ThemedText
    backgroundElement: '#1E2029',
    backgroundSelected:'#272A35',
  },
  light: {
    background:        '#F5F6FA',
    surface:           '#FFFFFF',
    surfaceHighlight:  '#E8E9F0',
    border:            '#D0D3E0',
    text:              '#13141A',
    textSecondary:     '#5A5E72',
    accent:            '#4A6CF7',
    accentMuted:       '#C8D2FC',
    danger:            '#D94040',
    success:           '#3D9E60',
    backgroundElement: '#FFFFFF',
    backgroundSelected:'#E8E9F0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark & keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans:    'Inter',
    serif:   'ui-serif',
    rounded: 'Sora',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'Inter',
    serif:   'serif',
    rounded: 'Sora',
    mono:    'monospace',
  },
  web: {
    sans:    'Inter',
    serif:   'var(--font-serif)',
    rounded: 'Sora',
    mono:    'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one:  4,
  two:  8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
} as const;

export const Radii = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

export const Typography = {
  displayLg: { fontSize: 48, fontWeight: '700' as const, lineHeight: 56 },
  displaySm: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headingLg: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headingSm: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body:      { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold:  { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption:   { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Aurora = {
  ink: '#0A0C12',
  teal: '#2DD4BF',
  indigo: '#6366F1',
  amber: '#F5B35C',
  glass: 'rgba(255,255,255,0.08)',
  glassStrong: 'rgba(255,255,255,0.12)',
  glassBorder: 'rgba(255,255,255,0.16)',
} as const;
