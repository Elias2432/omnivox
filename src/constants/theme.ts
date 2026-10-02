/**
 * Omnivox Mobile palette (matched to the official app screenshots):
 * - orange header bar (#F5821F) with white text
 * - blue links / active tab (#1E6FD9)
 * - red badges (#E53935)
 * - peach active-tab cell (#FBE9D0) with orange top indicator
 * - white / light-grey content, red & blue section bands
 */

import '@/global.css';

import { Platform } from 'react-native';

export const OX = {
  orange: '#F5821F',
  orangeDark: '#D96F12',
  bandRed: '#C0392B',
  bandBlue: '#1E88E5',
  link: '#1E6FD9',
  badge: '#E53935',
  activeTab: '#FBE9D0',
  tabIndicator: '#F5821F',
} as const;

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    backgroundAlt: '#F2F2F2',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECECEC',
    textSecondary: '#6B6B6B',
    accent: OX.link,
    header: OX.orange,
    headerText: '#FFFFFF',
    badge: OX.badge,
    danger: '#D70015',
    success: '#1F9D55',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundAlt: '#121212',
    backgroundElement: '#1C1C1E',
    backgroundSelected: '#2C2C2E',
    textSecondary: '#9E9E9E',
    accent: '#5AA3FF',
    header: '#1C1C1E',
    headerText: '#FFFFFF',
    badge: OX.badge,
    danger: '#FF6961',
    success: '#4CD964',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
