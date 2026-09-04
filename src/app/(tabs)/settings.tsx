import Constants from 'expo-constants';
import { useColorScheme } from 'nativewind';
import { Alert, ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { insertSampleData, resetAllData } from '@/db/seed';

type SchemePreference = 'system' | 'light' | 'dark';

const SCHEME_OPTIONS: ChipOption<SchemePreference>[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleSample = () => {
    Alert.alert('샘플 데이터', '예시 도료·소모품·킷을 추가할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '추가',
        onPress: async () => {
          await insertSampleData();
          Alert.alert('샘플 데이터를 추가했습니다');
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert('데이터 초기화', '등록한 모든 도료·소모품·킷 기록이 삭제됩니다. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          await resetAllData();
          Alert.alert('모든 데이터를 삭제했습니다');
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-8">
        <ScreenHeader title="설정" />

        <View className="gap-4 px-4">
          <Card className="gap-3">
            <Text variant="subtitle">화면 테마</Text>
            <ChipGroup
              options={SCHEME_OPTIONS}
              value={(colorScheme ?? 'system') as SchemePreference}
              onChange={(value) => setColorScheme(value)}
              wrap
            />
          </Card>

          <Card className="gap-3">
            <Text variant="subtitle">데이터</Text>
            <Text variant="muted">
              모든 기록은 기기 안에만 저장됩니다. 앱을 지우면 데이터도 함께 사라집니다.
            </Text>
            <Button variant="outline" size="sm" onPress={handleSample}>
              샘플 데이터 넣기
            </Button>
            <Button variant="outline" size="sm" onPress={handleReset}>
              <Text className="text-base font-semibold text-destructive">데이터 초기화</Text>
            </Button>
          </Card>

          <Card className="gap-1">
            <Text variant="subtitle">앱 정보</Text>
            <Text variant="muted">Painto {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            <Text variant="small">프라모델 도료·소모품 재고 관리</Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
