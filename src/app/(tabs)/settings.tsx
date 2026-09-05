import Constants from 'expo-constants';
import { Check } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { THEME_IDS, themes, type ThemeId } from '@/constants/themes';
import { insertSampleData, resetAllData } from '@/db/seed';
import { useAppSettingsContext } from '@/features/settings/provider';
import { LANGUAGES, LANGUAGE_LABELS } from '@/i18n/locales';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { t, language, setLanguage, themeId, setThemeId } = useAppSettingsContext();

  const handleSample = () => {
    Alert.alert(t('settings.sampleTitle'), t('settings.sampleMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.add'),
        onPress: async () => {
          await insertSampleData();
          Alert.alert(t('settings.sampleDone'));
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert(t('settings.reset'), t('settings.resetMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.resetConfirm'),
        style: 'destructive',
        onPress: async () => {
          await resetAllData();
          Alert.alert(t('settings.resetDone'));
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-8">
        <ScreenHeader title={t('settings.title')} />

        <View className="gap-4 px-4">
          <Card className="gap-3">
            <Text variant="subtitle">{t('settings.theme')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {THEME_IDS.map((id) => (
                <ThemeOption
                  key={id}
                  id={id}
                  selected={id === themeId}
                  label={t(`themes.${id}` as `themes.${ThemeId}`)}
                  onPress={() => setThemeId(id)}
                />
              ))}
            </View>
          </Card>

          <Card className="gap-3">
            <Text variant="subtitle">{t('settings.language')}</Text>
            <View className="gap-1">
              {LANGUAGES.map((code) => (
                <Pressable
                  key={code}
                  onPress={() => setLanguage(code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: code === language }}
                  className={cn(
                    'flex-row items-center gap-3 rounded-lg px-3 py-3 active:bg-muted',
                    code === language && 'bg-muted',
                  )}
                >
                  <Text
                    className={cn(
                      'flex-1 text-base text-foreground',
                      code === language && 'font-semibold',
                    )}
                  >
                    {LANGUAGE_LABELS[code]}
                  </Text>
                  {code === language ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          </Card>

          <Card className="gap-3">
            <Text variant="subtitle">{t('settings.data')}</Text>
            <Text variant="muted">{t('settings.dataNote')}</Text>
            <Button variant="outline" size="sm" onPress={handleSample}>
              {t('settings.sample')}
            </Button>
            <Button variant="outline" size="sm" onPress={handleReset}>
              <Text className="text-base font-semibold text-destructive">
                {t('settings.reset')}
              </Text>
            </Button>
          </Card>

          <Card className="gap-1">
            <Text variant="subtitle">{t('settings.appInfo')}</Text>
            <Text variant="muted">Painto {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            <Text variant="small">{t('settings.appTagline')}</Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** 테마 이름과 그 테마의 대표 색을 함께 보여 주는 선택 카드 */
function ThemeOption({
  id,
  label,
  selected,
  onPress,
}: {
  id: ThemeId;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const palette = themes[id];
  const swatches = [palette.background, palette.primary, palette.warning, palette.destructive];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'min-w-36 flex-1 gap-2 rounded-lg border p-3 active:opacity-80',
        selected ? 'border-primary bg-muted' : 'border-border',
      )}
    >
      <View className="flex-row gap-1">
        {swatches.map((color, index) => (
          <View
            key={`${id}-${index}`}
            className="h-5 flex-1 rounded border border-border"
            style={{ backgroundColor: color }}
          />
        ))}
      </View>
      <Text
        className={cn('text-sm text-foreground', selected && 'font-semibold')}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
