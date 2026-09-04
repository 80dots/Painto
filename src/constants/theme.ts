// Tailwind 유틸리티가 담긴 CSS 를 앱 진입 시점에 로드한다.
import '@/global.css';

import { DarkTheme, DefaultTheme } from 'expo-router';

/**
 * global.css 의 CSS 변수와 같은 값을 JS 에서도 쓰기 위한 팔레트.
 * (아이콘 color, 상태바, 네비게이션 테마처럼 className 을 못 쓰는 곳에서 사용)
 */
export const themeColors = {
  light: {
    background: '#FFFFFF',
    foreground: '#0C0A09',
    card: '#FFFFFF',
    muted: '#F5F5F4',
    mutedForeground: '#78716C',
    border: '#E7E5E4',
    primary: '#F97316',
    primaryForeground: '#FAFAF9',
    destructive: '#EF4444',
    success: '#16A34A',
    warning: '#F59E0B',
  },
  dark: {
    background: '#0C0A09',
    foreground: '#FAFAF9',
    card: '#1C1917',
    muted: '#292524',
    mutedForeground: '#A8A29E',
    border: '#37322F',
    primary: '#EA580C',
    primaryForeground: '#FAFAF9',
    destructive: '#DC2626',
    success: '#4ADE80',
    warning: '#F59E0B',
  },
} as const;

export type AppColorScheme = keyof typeof themeColors;
export type ThemePalette = (typeof themeColors)[AppColorScheme];

export const navigationThemes: Record<AppColorScheme, typeof DefaultTheme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: themeColors.light.primary,
      background: themeColors.light.background,
      card: themeColors.light.background,
      text: themeColors.light.foreground,
      border: themeColors.light.border,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.dark.primary,
      background: themeColors.dark.background,
      card: themeColors.dark.background,
      text: themeColors.dark.foreground,
      border: themeColors.dark.border,
    },
  },
};

export const MaxContentWidth = 800;
