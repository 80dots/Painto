import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import migrations from '../../drizzle/migrations';
import { db } from './client';
import { seedBuiltInBrands } from './seed';

import { Text } from '@/components/ui/text';
import { standaloneT } from '@/features/settings/provider';

/**
 * 앱 시작 시 마이그레이션을 적용하고 기본 데이터를 채운 뒤 화면을 그린다.
 * 데이터가 준비되기 전에 화면이 뜨면 빈 목록이 잠깐 보이므로 여기서 막는다.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    seedBuiltInBrands()
      .then(() => setSeeded(true))
      .catch((e: Error) => setSeedError(e));
  }, [success]);

  const failure = error ?? seedError;

  if (failure) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-background p-8">
        <Text variant="subtitle">{standaloneT('db.openFailed')}</Text>
        <Text variant="muted" className="text-center">
          {failure.message}
        </Text>
      </View>
    );
  }

  if (!success || !seeded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}
