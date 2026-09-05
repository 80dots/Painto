// Tailwind 유틸리티가 담긴 CSS 를 앱 진입 시점에 로드한다.
import '@/global.css';

import { DarkTheme, DefaultTheme } from 'expo-router';

import type { ThemePalette } from '@/constants/themes';

/** 선택한 컬러 테마를 react-navigation 테마로 옮긴다 */
export function navigationTheme(palette: ThemePalette): typeof DefaultTheme {
  const base = palette.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.background,
      text: palette.foreground,
      border: palette.border,
    },
  };
}

export const MaxContentWidth = 800;
