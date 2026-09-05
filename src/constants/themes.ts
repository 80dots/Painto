/**
 * 컬러 테마. 프라모델 장르별 대표 색을 골라 한 벌씩 구성했다.
 * 값은 그대로 CSS 변수(`vars()`)로 주입되고, tailwind.config.js 의
 * `var(--토큰)` 색상이 이를 읽는다. 아이콘·상태바처럼 className 을 못 쓰는
 * 곳에서는 같은 값을 JS 로 직접 쓴다.
 */
export const THEME_IDS = [
  'gundamEfsf',
  'gundamZeon',
  'tank',
  'aircraft',
  'fss',
  'armoredCore',
  'warhammer',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ThemePalette = {
  /** 상태바·네비게이션 기본값을 고르기 위한 밝기 구분 */
  isDark: boolean;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  warning: string;
};

export const themes: Record<ThemeId, ThemePalette> = {
  /** RX-78-2 트라이컬러 — 흰 장갑에 연방 블루, 포인트로 적/황 */
  gundamEfsf: {
    isDark: false,
    background: '#F6F8FC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    muted: '#E7EDF6',
    mutedForeground: '#5A6678',
    border: '#D3DDEB',
    input: '#D3DDEB',
    ring: '#1E4FA3',
    primary: '#1E4FA3',
    primaryForeground: '#FFFFFF',
    secondary: '#E7EDF6',
    secondaryForeground: '#0F172A',
    accent: '#E7EDF6',
    accentForeground: '#0F172A',
    destructive: '#C8102E',
    destructiveForeground: '#FFFFFF',
    success: '#178A4C',
    warning: '#E9B317',
  },

  /** 지온 — 자쿠 그린 군용 톤에 샤아 레드 */
  gundamZeon: {
    isDark: true,
    background: '#12180F',
    foreground: '#E9F0E2',
    card: '#1B2318',
    cardForeground: '#E9F0E2',
    muted: '#26301F',
    mutedForeground: '#A2B396',
    border: '#33402A',
    input: '#33402A',
    ring: '#7C9A52',
    primary: '#7C9A52',
    primaryForeground: '#0F140C',
    secondary: '#26301F',
    secondaryForeground: '#E9F0E2',
    accent: '#26301F',
    accentForeground: '#E9F0E2',
    destructive: '#C0392B',
    destructiveForeground: '#FFF3F1',
    success: '#8CBF54',
    warning: '#D9A441',
  },

  /** 전차 — 올리브 드랩과 러스트 */
  tank: {
    isDark: true,
    background: '#191611',
    foreground: '#EFE7D6',
    card: '#241F17',
    cardForeground: '#EFE7D6',
    muted: '#2F281E',
    mutedForeground: '#A99F8A',
    border: '#3C3426',
    input: '#3C3426',
    ring: '#9A8F4A',
    primary: '#8C8443',
    primaryForeground: '#12100B',
    secondary: '#2F281E',
    secondaryForeground: '#EFE7D6',
    accent: '#2F281E',
    accentForeground: '#EFE7D6',
    destructive: '#B4462F',
    destructiveForeground: '#FFF1EC',
    success: '#7A9A4B',
    warning: '#D2A24C',
  },

  /** 항공기 — 실버와 스틸 블루, 하늘빛 */
  aircraft: {
    isDark: false,
    background: '#F1F5F9',
    foreground: '#15202B',
    card: '#FFFFFF',
    cardForeground: '#15202B',
    muted: '#E2E9F0',
    mutedForeground: '#5D6B7A',
    border: '#CCD6E1',
    input: '#CCD6E1',
    ring: '#2E6E9E',
    primary: '#2E6E9E',
    primaryForeground: '#FFFFFF',
    secondary: '#E2E9F0',
    secondaryForeground: '#15202B',
    accent: '#E2E9F0',
    accentForeground: '#15202B',
    destructive: '#B93A2E',
    destructiveForeground: '#FFFFFF',
    success: '#2E8B57',
    warning: '#D79A00',
  },

  /** FSS — 골드 A.K.D. 와 아이보리, 딥 레드 */
  fss: {
    isDark: false,
    background: '#FAF6ED',
    foreground: '#2A2117',
    card: '#FFFFFF',
    cardForeground: '#2A2117',
    muted: '#EFE6D3',
    mutedForeground: '#75664F',
    border: '#DED1B6',
    input: '#DED1B6',
    ring: '#B08427',
    primary: '#A8801F',
    primaryForeground: '#FFF9EC',
    secondary: '#EFE6D3',
    secondaryForeground: '#2A2117',
    accent: '#EFE6D3',
    accentForeground: '#2A2117',
    destructive: '#9B2335',
    destructiveForeground: '#FFF1F2',
    success: '#4E7A46',
    warning: '#C8862A',
  },

  /** 아머드 코어 — 인더스트리얼 다크에 HUD 오렌지 */
  armoredCore: {
    isDark: true,
    background: '#0C0E11',
    foreground: '#E6EAF0',
    card: '#14181D',
    cardForeground: '#E6EAF0',
    muted: '#1D222A',
    mutedForeground: '#8A93A1',
    border: '#2A313B',
    input: '#2A313B',
    ring: '#FF7A18',
    primary: '#FF7A18',
    primaryForeground: '#0C0E11',
    secondary: '#1D222A',
    secondaryForeground: '#E6EAF0',
    accent: '#1D222A',
    accentForeground: '#E6EAF0',
    destructive: '#E5484D',
    destructiveForeground: '#FFF0F0',
    success: '#30A46C',
    warning: '#F5A524',
  },

  /** 워해머 — 그림다크. 블러드 레드와 본, 금장 */
  warhammer: {
    isDark: true,
    background: '#14100E',
    foreground: '#EDE3D1',
    card: '#1D1816',
    cardForeground: '#EDE3D1',
    muted: '#29211E',
    mutedForeground: '#A29289',
    border: '#3A2F2B',
    input: '#3A2F2B',
    ring: '#C0A062',
    primary: '#9B2318',
    primaryForeground: '#F6EAD8',
    secondary: '#29211E',
    secondaryForeground: '#EDE3D1',
    accent: '#29211E',
    accentForeground: '#EDE3D1',
    destructive: '#C4342B',
    destructiveForeground: '#FFF0EC',
    success: '#5E8C4A',
    warning: '#C9A227',
  },
};

export const DEFAULT_THEME_ID: ThemeId = 'gundamEfsf';

/** NativeWind `vars()` 에 넘길 CSS 변수 묶음 */
export function themeVariables(palette: ThemePalette) {
  return {
    '--background': palette.background,
    '--foreground': palette.foreground,
    '--card': palette.card,
    '--card-foreground': palette.cardForeground,
    '--muted': palette.muted,
    '--muted-foreground': palette.mutedForeground,
    '--border': palette.border,
    '--input': palette.input,
    '--ring': palette.ring,
    '--primary': palette.primary,
    '--primary-foreground': palette.primaryForeground,
    '--secondary': palette.secondary,
    '--secondary-foreground': palette.secondaryForeground,
    '--accent': palette.accent,
    '--accent-foreground': palette.accentForeground,
    '--destructive': palette.destructive,
    '--destructive-foreground': palette.destructiveForeground,
    '--success': palette.success,
    '--warning': palette.warning,
  };
}
