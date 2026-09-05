import * as Localization from 'expo-localization';
import { vars } from 'nativewind';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  DEFAULT_THEME_ID,
  themeVariables,
  themes,
  type ThemeId,
  type ThemePalette,
} from '@/constants/themes';
import { SETTING_KEYS, setSetting, useAppSettings } from '@/features/settings/queries';
import { LANGUAGES, catalogs, type Language, type Translation } from '@/i18n/locales';

/** "section.key" 형태의 번역 키만 허용한다 (오타는 타입 오류로 잡힌다) */
export type TranslationKey = {
  [Section in keyof Translation]: {
    [Key in keyof Translation[Section]]: Translation[Section][Key] extends string
      ? `${Section & string}.${Key & string}`
      : never;
  }[keyof Translation[Section]];
}[keyof Translation];

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

type AppSettingsValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  palette: ThemePalette;
  catalog: Translation;
  t: Translate;
};

const AppSettingsContext = createContext<AppSettingsValue | null>(null);

/** 기기 언어를 지원 목록에 맞춘다. 없으면 영어. */
function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return LANGUAGES.find((language) => language === code) ?? 'en';
}

function translate(
  catalog: Translation,
  key: TranslationKey,
  params?: Record<string, string | number>,
) {
  const [section, name] = key.split('.') as [keyof Translation, string];
  const value = (catalog[section] as Record<string, unknown> | undefined)?.[name];
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, token: string) => String(params[token] ?? ''));
}

/**
 * 언어와 컬러 테마를 함께 제공한다.
 * 테마 값은 CSS 변수로 주입되므로 화면 코드는 `bg-background` 같은 토큰만 쓰면 된다.
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useAppSettings();

  const stored = useMemo(() => {
    const map = new Map((data ?? []).map((row) => [row.key, row.value]));
    return {
      language: map.get(SETTING_KEYS.language),
      theme: map.get(SETTING_KEYS.theme),
    };
  }, [data]);

  const language = useMemo<Language>(() => {
    const saved = LANGUAGES.find((item) => item === stored.language);
    return saved ?? deviceLanguage();
  }, [stored.language]);

  const themeId = useMemo<ThemeId>(() => {
    const saved = stored.theme as ThemeId | undefined;
    return saved && saved in themes ? saved : DEFAULT_THEME_ID;
  }, [stored.theme]);

  const palette = themes[themeId];
  const catalog = catalogs[language];

  const t = useCallback<Translate>((key, params) => translate(catalog, key, params), [catalog]);

  const value = useMemo<AppSettingsValue>(
    () => ({
      language,
      setLanguage: (next) => {
        setSetting(SETTING_KEYS.language, next);
      },
      themeId,
      setThemeId: (next) => {
        setSetting(SETTING_KEYS.theme, next);
      },
      palette,
      catalog,
      t,
    }),
    [catalog, language, palette, t, themeId],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      <View style={vars(themeVariables(palette))} className="flex-1 bg-background">
        {children}
      </View>
    </AppSettingsContext.Provider>
  );
}

export function useAppSettingsContext() {
  const value = useContext(AppSettingsContext);
  if (!value) throw new Error('AppSettingsProvider 안에서만 쓸 수 있습니다.');
  return value;
}

/** 번역 함수만 필요할 때 */
export function useT() {
  return useAppSettingsContext().t;
}

/**
 * 프로바이더 밖(DB 준비 전 화면)에서 쓰는 번역.
 * 저장된 설정을 읽을 수 없으므로 기기 언어를 그대로 쓴다.
 */
export function standaloneT(key: TranslationKey, params?: Record<string, string | number>) {
  return translate(catalogs[deviceLanguage()], key, params);
}
