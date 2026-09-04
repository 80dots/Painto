import { useRouter } from 'expo-router';
import { Palette, Plus, ScanBarcode } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PAINT_TYPES, type PaintType } from '@/db/schema';
import { PaintRow } from '@/features/paints/components/paint-row';
import { adjustPaintQuantity, usePaintList, type PaintSort } from '@/features/paints/queries';
import { useTheme } from '@/hooks/use-theme';
import { PAINT_TYPE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS: ChipOption<PaintType | null>[] = [
  { value: null, label: '전체' },
  ...PAINT_TYPES.map((type) => ({ value: type, label: PAINT_TYPE_LABELS[type] })),
];

const SORT_LABELS: Record<PaintSort, string> = {
  recent: '최근 수정',
  name: '이름',
  brand: '브랜드',
  quantity: '재고 적은 순',
};

const SORT_CYCLE: PaintSort[] = ['recent', 'name', 'brand', 'quantity'];

export default function PaintsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<PaintType | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [sort, setSort] = useState<PaintSort>('recent');

  const { data } = usePaintList({ search, type, onlyLowStock, onlyFavorite, sort });
  const paints = data ?? [];

  const cycleSort = () => {
    const index = SORT_CYCLE.indexOf(sort);
    setSort(SORT_CYCLE[(index + 1) % SORT_CYCLE.length]);
  };

  return (
    <Screen>
      <ScreenHeader
        title="도료"
        subtitle={`${paints.length}종`}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/paint/scan')}
              accessibilityLabel="바코드 스캔"
              className="h-10 w-10 items-center justify-center rounded-lg border border-border active:bg-muted"
            >
              <ScanBarcode size={20} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/paint/new')}
              accessibilityLabel="도료 추가"
              className="h-10 w-10 items-center justify-center rounded-lg bg-primary active:opacity-90"
            >
              <Plus size={20} color={colors.primaryForeground} />
            </Pressable>
          </View>
        }
      />

      <View className="gap-3 px-4 pb-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="이름 · 품번 · 브랜드 검색"
        />
        <ChipGroup options={TYPE_OPTIONS} value={type} onChange={setType} />

        <View className="flex-row items-center gap-2">
          <FilterToggle
            label="부족만"
            active={onlyLowStock}
            onPress={() => setOnlyLowStock((v) => !v)}
          />
          <FilterToggle
            label="즐겨찾기"
            active={onlyFavorite}
            onPress={() => setOnlyFavorite((v) => !v)}
          />
          <View className="flex-1" />
          <Pressable onPress={cycleSort} className="rounded-md px-2 py-1 active:bg-muted">
            <Text variant="small">정렬: {SORT_LABELS[sort]}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={paints}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <PaintRow
            item={item}
            onPress={() => router.push(`/paint/${item.id}`)}
            onAdjust={(delta) =>
              adjustPaintQuantity(item.id, delta, delta > 0 ? 'purchase' : 'use')
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Palette}
            title={
              search || type || onlyLowStock
                ? '조건에 맞는 도료가 없습니다'
                : '등록된 도료가 없습니다'
            }
            description="오른쪽 위 + 버튼으로 보유한 도료를 등록해 보세요."
            actionLabel="도료 추가"
            onAction={() => router.push('/paint/new')}
          />
        }
      />
    </Screen>
  );
}

function FilterToggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      className={cn(
        'rounded-md border px-3 py-1.5',
        active ? 'border-primary bg-primary' : 'border-border bg-card',
      )}
    >
      <Text
        className={cn(
          'text-xs font-medium',
          active ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
