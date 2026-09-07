import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ColorSwatch } from '@/features/paints/components/color-swatch';
import { searchCatalog, type CatalogPaint } from '@/features/paints/catalog';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';

export type CatalogSuggestionsProps = {
  /** 이름 입력칸에 친 글자 */
  query: string;
  onPick: (paint: CatalogPaint) => void;
};

/**
 * 내장 도료 카탈로그에서 이름·품번이 맞는 것을 추려 보여 준다.
 * 고르면 브랜드·품번·종류·광택·용량·색상·희석비가 한 번에 채워진다.
 */
export function CatalogSuggestions({ query, onPick }: CatalogSuggestionsProps) {
  const { colors } = useTheme();
  const t = useT();

  const matches = useMemo(() => searchCatalog(query), [query]);
  if (matches.length === 0) return null;

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card">
      <View className="flex-row items-center gap-2 border-b border-border px-3 py-2">
        <Sparkles size={14} color={colors.mutedForeground} />
        <Text variant="small">{t('paintForm.catalogHint')}</Text>
      </View>

      {matches.map((paint, index) => (
        <Pressable
          key={paint.id}
          onPress={() => onPick(paint)}
          accessibilityRole="button"
          className={
            index === 0
              ? 'flex-row items-center gap-3 px-3 py-2 active:bg-muted'
              : 'flex-row items-center gap-3 border-t border-border px-3 py-2 active:bg-muted'
          }
        >
          <ColorSwatch color={paint.colorHex} fallbackText={paint.code} size="sm" />

          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {paint.name}
            </Text>
            <Text variant="small" numberOfLines={1}>
              {[paint.brand, paint.code, paint.nameEn].filter(Boolean).join(' · ')}
            </Text>
          </View>

          {paint.volumeMl ? <Text variant="small">{paint.volumeMl}ml</Text> : null}
        </Pressable>
      ))}
    </View>
  );
}
