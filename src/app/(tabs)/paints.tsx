import { useRouter } from 'expo-router';
import { Plus, ScanBarcode } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';

import { PaintBottle } from '@/components/icons/paint-bottle';
import { ScreenHeader } from '@/components/screen-header';
import { SearchBar } from '@/components/search-bar';
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { PAINT_TYPES, type PaintType } from '@/db/schema';
import { PaintRow } from '@/features/paints/components/paint-row';
import {
  adjustPaintQuantity,
  usePaintList,
  usePaintTypesInUse,
  type PaintListItem,
  type PaintSort,
} from '@/features/paints/queries';
import { useT, type TranslationKey } from '@/features/settings/provider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

/** 브랜드로 묶어서 보여 주므로 정렬은 그룹 안에서만 쓴다 */
const SORT_CYCLE: PaintSort[] = ['recent', 'name', 'quantity'];

const SORT_KEYS: Record<PaintSort, TranslationKey> = {
  recent: 'paints.sortRecent',
  name: 'paints.sortName',
  brand: 'paints.sortBrand',
  quantity: 'paints.sortQuantity',
};

type BrandSection = {
  key: string;
  title: string;
  line: string | null;
  data: PaintListItem[];
};

/** 목록을 브랜드별로 묶는다. 브랜드가 없는 도료는 맨 뒤로 보낸다. */
function groupByBrand(paints: PaintListItem[], noBrandLabel: string): BrandSection[] {
  const sections = new Map<string, BrandSection>();

  for (const paint of paints) {
    const key = paint.brandId === null ? 'none' : String(paint.brandId);
    let section = sections.get(key);
    if (!section) {
      section = {
        key,
        title: paint.brandName ?? noBrandLabel,
        line: paint.brandLine,
        data: [],
      };
      sections.set(key, section);
    }
    section.data.push(paint);
  }

  return [...sections.values()].sort((a, b) => {
    if (a.key === 'none') return 1;
    if (b.key === 'none') return -1;
    const byName = a.title.localeCompare(b.title, 'ko');
    return byName !== 0 ? byName : (a.line ?? '').localeCompare(b.line ?? '', 'ko');
  });
}

export default function PaintsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const t = useT();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<PaintType | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [sort, setSort] = useState<PaintSort>('recent');

  const { data: typeRows } = usePaintTypesInUse();

  // 등록된 종류만 칩으로 보여 준다 (하나도 없는 종류는 고를 이유가 없다)
  const typeOptions = useMemo<ChipOption<PaintType | null>[]>(() => {
    const inUse = new Set((typeRows ?? []).map((row) => row.type));
    return [
      { value: null, label: t('common.all') },
      ...PAINT_TYPES.filter((item) => inUse.has(item)).map((item) => ({
        value: item,
        label: t(`paintType.${item}`),
      })),
    ];
  }, [t, typeRows]);

  // 고르고 있던 종류의 도료가 모두 사라졌다면 그 필터는 없는 것으로 친다
  const activeType = typeOptions.some((option) => option.value === type) ? type : null;

  const { data } = usePaintList({ search, type: activeType, onlyLowStock, onlyFavorite, sort });
  const paints = useMemo(() => data ?? [], [data]);
  const noBrandLabel = t('paints.noBrand');
  const sections = useMemo(() => groupByBrand(paints, noBrandLabel), [noBrandLabel, paints]);

  const cycleSort = () => {
    const index = SORT_CYCLE.indexOf(sort);
    setSort(SORT_CYCLE[(index + 1) % SORT_CYCLE.length]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={t('paints.title')}
        subtitle={t('paints.subtitle', { count: paints.length, brands: sections.length })}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/paint/scan')}
              accessibilityLabel={t('a11y.scanBarcode')}
              className="h-10 w-10 items-center justify-center rounded-lg border border-border active:bg-muted"
            >
              <ScanBarcode size={20} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/paint/new')}
              accessibilityLabel={t('paints.add')}
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
          placeholder={t('paints.searchPlaceholder')}
        />
        {typeOptions.length > 1 ? (
          <ChipGroup options={typeOptions} value={activeType} onChange={setType} />
        ) : null}

        <View className="flex-row items-center gap-2">
          <FilterToggle
            label={t('paints.onlyLow')}
            active={onlyLowStock}
            onPress={() => setOnlyLowStock((v) => !v)}
          />
          <FilterToggle
            label={t('paints.onlyFavorite')}
            active={onlyFavorite}
            onPress={() => setOnlyFavorite((v) => !v)}
          />
          <View className="flex-1" />
          <Pressable onPress={cycleSort} className="rounded-md px-2 py-1 active:bg-muted">
            <Text variant="small">{t('common.sort', { value: t(SORT_KEYS[sort]) })}</Text>
          </Pressable>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center gap-2 border-b border-border bg-muted px-4 py-2">
            <Text className="text-sm font-semibold text-foreground">{section.title}</Text>
            {section.line ? <Text variant="small">{section.line}</Text> : null}
            <View className="flex-1" />
            <Text variant="small">{t('count.kinds', { count: section.data.length })}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <PaintRow
            item={item}
            showBrand={false}
            onPress={() => router.push(`/paint/${item.id}`)}
            onAdjust={(delta) =>
              adjustPaintQuantity(item.id, delta, delta > 0 ? 'purchase' : 'use')
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={PaintBottle}
            title={
              search || activeType || onlyLowStock ? t('paints.emptyFiltered') : t('paints.empty')
            }
            description={t('paints.emptyDescription')}
            actionLabel={t('paints.add')}
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
