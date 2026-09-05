import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { appSettings } from '@/db/schema';

export const SETTING_KEYS = {
  language: 'language',
  theme: 'theme',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** 앱 설정 전체 (언어·테마). 값이 바뀌면 화면이 바로 다시 그려진다. */
export function useAppSettings() {
  return useLiveQuery(db.select().from(appSettings));
}

export async function setSetting(key: SettingKey, value: string) {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function clearSetting(key: SettingKey) {
  await db.delete(appSettings).where(eq(appSettings.key, key));
}
