import { Stack, useRouter } from 'expo-router';
import { Disc3, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import type { Supply } from '@/db/schema';
import {
  adjustSupplyQuantity,
  createSupply,
  MASKING_CATEGORY,
  useMaskingTapes,
} from '@/features/supplies/queries';
import { useTheme } from '@/hooks/use-theme';
import { MASKING_WIDTH_PRESETS } from '@/lib/labels';
import { formatQuantity } from '@/lib/utils';

/** 목록에 아직 없는 폭을 한 번에 등록할 수 있게 자주 쓰는 폭을 보여준다. */
const QUICK_WIDTHS = [3, 6, 10, 18] as const;

export default function MaskingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const { data } = useMaskingTapes(search);
  const tapes = data ?? [];

  const rolls = tapes.reduce((sum, tape) => sum + tape.quantity, 0);
  const ownedWidths = new Set(tapes.map((tape) => tape.widthMm));
  const missingWidths = QUICK_WIDTHS.filter((width) => !ownedWidths.has(width));

  const quickAdd = async (widthMm: number) => {
    await createSupply({
      name: `마스킹 테이프 ${widthMm}mm`,
      category: MASKING_CATEGORY,
      widthMm,
      quantity: 1,
      unit: '롤',
      minQuantity: 1,
    });
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: `마스킹 테이프 ${tapes.length}종`,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/supply/new?category=masking')}
              accessibilityLabel="마스킹 테이프 추가"
              hitSlop={8}
            >
              <Plus size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View className="gap-3 px-4 pb-3 pt-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="이름 · 브랜드 · 규격 검색"
        />
        {tapes.length > 0 ? <Text variant="muted">보유 {formatQuantity(rolls)}롤</Text> : null}
      </View>

      <FlatList
        data={tapes}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <MaskingRow
            item={item}
            onPress={() => router.push(`/supply/${item.id}`)}
            onAdjust={(delta) =>
              adjustSupplyQuantity(item.id, delta, delta > 0 ? 'purchase' : 'use')
            }
          />
        )}
        ListFooterComponent={
          missingWidths.length > 0 && !search ? (
            <View className="gap-2 px-4 pt-4">
              <Text variant="small">자주 쓰는 폭 빠르게 추가</Text>
              <View className="flex-row flex-wrap gap-2">
                {missingWidths.map((width) => (
                  <Pressable
                    key={width}
                    onPress={() => quickAdd(width)}
                    className="flex-row items-center gap-1 rounded-md border border-border bg-card px-3 py-2 active:bg-muted"
                  >
                    <Plus size={14} color={colors.mutedForeground} />
                    <Text className="text-sm font-medium text-foreground">{width}mm</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={Disc3}
            title={search ? '조건에 맞는 테이프가 없습니다' : '등록된 마스킹 테이프가 없습니다'}
            description={`폭(mm)별로 남은 롤 수를 관리합니다. 자주 쓰는 폭은 ${MASKING_WIDTH_PRESETS.slice(0, 5).join('·')}mm 입니다.`}
            actionLabel="직접 추가"
            onAction={() => router.push('/supply/new?category=masking')}
          />
        }
      />
    </Screen>
  );
}

function MaskingRow({
  item,
  onPress,
  onAdjust,
}: {
  item: Supply;
  onPress: () => void;
  onAdjust: (delta: number) => void;
}) {
  const { colors } = useTheme();
  const isOut = item.quantity <= 0;
  const isLow = !isOut && item.quantity <= item.minQuantity;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
    >
      <View className="h-11 w-14 items-center justify-center rounded-md border border-border bg-muted">
        <Text className="text-sm font-bold text-foreground">
          {item.widthMm ? `${formatQuantity(item.widthMm)}mm` : '—'}
        </Text>
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          {item.brand ? <Text variant="small">{item.brand}</Text> : null}
          {item.spec ? <Text variant="small">{item.spec}</Text> : null}
          {isOut ? <Badge label="품절" variant="destructive" /> : null}
          {isLow ? <Badge label="부족" variant="warning" /> : null}
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => onAdjust(-1)}
          hitSlop={6}
          accessibilityLabel="재고 1 줄이기"
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Minus size={14} color={colors.foreground} />
        </Pressable>
        <View className="min-w-12 items-center">
          <Text className="text-base font-semibold text-foreground">
            {formatQuantity(item.quantity)}
          </Text>
          <Text variant="small">{item.unit}</Text>
        </View>
        <Pressable
          onPress={() => onAdjust(1)}
          hitSlop={6}
          accessibilityLabel="재고 1 늘리기"
          className="h-8 w-8 items-center justify-center rounded-md border border-border active:bg-muted"
        >
          <Plus size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </Pressable>
  );
}
