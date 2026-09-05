import { useAppSettingsContext } from '@/features/settings/provider';

/**
 * className 으로 처리할 수 없는 곳(아이콘 color, 상태바 등)에서 쓰는 팔레트.
 * 색 자체는 CSS 변수로도 주입되므로 화면 코드는 되도록 토큰 클래스를 쓴다.
 */
export function useTheme() {
  const { palette, themeId, setThemeId } = useAppSettingsContext();
  return { colors: palette, palette, themeId, setThemeId };
}
