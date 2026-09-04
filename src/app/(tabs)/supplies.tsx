import { useRouter } from 'expo-router';
import { Plus, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { SUPPLY_CATEGORIES, type SupplyCategory } from '@/db/schema';
import { SupplyRow } from '@/features/supplies/components/supply-row';
import { adjustSupplyQuantity, useSupplyList } from '@/features/supplies/queries';
import { useTheme } from '@/hooks/use-theme';
import { SUPPLY_CATEGORY_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS: ChipOption<SupplyCategory | null>[] = [
  { value: null, label: '전체' },
  ...SUPPLY_CATEGORIES.map((category) => ({
    value: category,
    label: SUPPLY_CATEGORY_LABELS[category],
  })),
];

export default function SuppliesScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SupplyCategory | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const { data } = useSupplyList({ search, category, onlyLowStock });
  const supplies = data ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="소모품"
        subtitle={`${supplies.length}종`}
        right={
          <Pressable
            onPress={() => router.push('/supply/new')}
            accessibilityLabel="소모품 추가"
            className="h-10 w-10 items-center justify-center rounded-lg bg-primary active:opacity-90"
          >
            <Plus size={20} color={colors.primaryForeground} />
          </Pressable>
        }
      />

      <View className="gap-3 px-4 pb-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="이름 · 브랜드 · 규격 검색"
        />
        <ChipGroup options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setOnlyLowStock((v) => !v)}
            accessibilityRole="switch"
            accessibilityState={{ checked: onlyLowStock }}
            className={cn(
              'rounded-md border px-3 py-1.5',
              onlyLowStock ? 'border-primary bg-primary' : 'border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                onlyLowStock ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              부족만
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={supplies}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <SupplyRow
            item={item}
            onPress={() => router.push(`/supply/${item.id}`)}
            onAdjust={(delta) =>
              adjustSupplyQuantity(item.id, delta, delta > 0 ? 'purchase' : 'use')
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Wrench}
            title={
              search || category || onlyLowStock
                ? '조건에 맞는 소모품이 없습니다'
                : '등록된 소모품이 없습니다'
            }
            description="사포, 접착제, 마스킹 테이프 같은 소모품을 등록해 두면 떨어지기 전에 알 수 있습니다."
            actionLabel="소모품 추가"
            onAction={() => router.push('/supply/new')}
          />
        }
      />
    </Screen>
  );
}
