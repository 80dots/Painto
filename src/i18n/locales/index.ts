import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { ko } from './ko';
import type { Translation } from './types';
import { zh } from './zh';

export const LANGUAGES = ['ko', 'en', 'ja', 'fr', 'es', 'zh'] as const;
export type Language = (typeof LANGUAGES)[number];

/** 설정 화면에 그대로 노출하는 이름 (각 언어 표기) */
export const LANGUAGE_LABELS: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  es: 'Español',
  zh: '中文',
};

export const catalogs: Record<Language, Translation> = { ko, en, ja, fr, es, zh };

export type { Translation };
