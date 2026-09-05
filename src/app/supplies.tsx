import { Stack, useRouter } from 'expo-router';
import { Plus, Wrench } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { SUPPLY_CATEGORIES, type SupplyCategory } from '@/db/schema';
import { SupplyRow } from '@/features/supplies/components/supply-row';
import { adjustSupplyQuantity, MASKING_CATEGORY, useSupplyList } from '@/features/supplies/queries';
import { useT } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

// 마스킹 테이프는 전용 화면에서 폭별로 관리하므로 여기서는 뺀다.
export default function SuppliesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const t = useT();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SupplyCategory | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // 마스킹 테이프는 전용 화면에서 폭별로 관리하므로 여기서는 뺀다.
  const categoryOptions = useMemo<ChipOption<SupplyCategory | null>[]>(
    () => [
      { value: null, label: t('common.all') },
      ...SUPPLY_CATEGORIES.filter((item) => item !== MASKING_CATEGORY).map((item) => ({
        value: item,
        label: t(`supplyCategory.${item}`),
      })),
    ],
    [t],
  );

  const { data } = useSupplyList({
    search,
    category,
    onlyLowStock,
    excludeCategory: MASKING_CATEGORY,
  });
  const supplies = data ?? [];

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: t('supplies.title', { count: supplies.length }),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/supply/new')}
              accessibilityLabel={t('supplies.add')}
              hitSlop={8}
            >
              <Plus size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View className="gap-3 px-4 pb-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('supplies.searchPlaceholder')}
        />
        <ChipGroup options={categoryOptions} value={category} onChange={setCategory} />
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
              {t('supplies.onlyLow')}
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
              search || category || onlyLowStock ? t('supplies.emptyFiltered') : t('supplies.empty')
            }
            description={t('supplies.emptyDescription')}
            actionLabel={t('supplies.addShort')}
            onAction={() => router.push('/supply/new')}
          />
        }
      />
    </Screen>
  );
}
