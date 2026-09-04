import { useColorScheme } from 'nativewind';

import { themeColors, type AppColorScheme } from '@/constants/theme';

/**
 * NativeWind 의 색상 스킴과 JS 팔레트를 함께 돌려준다.
 * className 으로 처리할 수 없는 곳(아이콘, 상태바 등)에서 colors 를 쓴다.
 */
export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme: AppColorScheme = colorScheme === 'dark' ? 'dark' : 'light';

  return { scheme, colors: themeColors[scheme], setColorScheme };
}
